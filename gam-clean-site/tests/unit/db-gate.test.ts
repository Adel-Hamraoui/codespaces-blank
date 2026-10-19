// File d'attente du pool (Transaction pooler) : une requête par connexion à la fois.
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createGate } from '../../backend/db/client'

describe('file d’attente des requêtes', () => {
  it('jamais plus de requêtes en cours que de places, dans l’ordre d’arrivée', () => {
    const gate = createGate(2)
    const started: number[] = []
    const done = [1, 2, 3, 4].map((n) => gate.enter(() => started.push(n)))
    assert.deepEqual(started, [1, 2])
    done[1]()
    assert.deepEqual(started, [1, 2, 3])
    done[1]() // une seconde libération est sans effet
    assert.deepEqual(started, [1, 2, 3])
    done[0]()
    assert.deepEqual(started, [1, 2, 3, 4])
  })

  it('une requête abandonnée avant son tour ne démarre jamais', () => {
    const gate = createGate(1)
    const started: string[] = []
    const first = gate.enter(() => started.push('a'))
    const second = gate.enter(() => started.push('b'))
    gate.enter(() => started.push('c'))
    second(true) // délai dépassé dans la file
    first()
    assert.deepEqual(started, ['a', 'c'])
  })

  it('une connexion bloquée garde sa place ; fin signalée quand le reste est terminé', () => {
    const gate = createGate(2)
    const started: string[] = []
    let idle = false
    const hung = gate.enter(() => started.push('bloquée'))
    const slow = gate.enter(() => started.push('lente'))
    const queued = gate.enter(() => started.push('en attente'))
    hung(true)
    gate.whenIdle(() => (idle = true))
    assert.deepEqual(started, ['bloquée', 'lente']) // la place de la connexion bloquée n'est pas réutilisée
    slow()
    assert.deepEqual(started, ['bloquée', 'lente', 'en attente'])
    assert.equal(idle, false)
    queued()
    assert.equal(idle, true)
  })
})
