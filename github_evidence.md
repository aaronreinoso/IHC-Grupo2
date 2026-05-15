# Evidencia GitHub y control de versiones

## Estructura esperada del repositorio

```text
Usability-Test-Dashboard-2.0/
│
├── HCI-PruebaFinal/
│   ├── product_backlog.md
│   ├── sprint_planning.md
│   ├── heuristic_evaluation.md
│   ├── ai_evidence.md
│   ├── github_evidence.md
│   ├── wireframes/
│   │   └── wireframes_login.md
│   └── implementation/
│       └── technical_changes.md
│
└── README.md
```

## Commits sugeridos

| Commit | Mensaje | Evidencia |
|---|---|---|
| 1 | `docs: add product backlog for hci final test` | Se agrega priorización Scrum y backlog. |
| 2 | `docs: add sprint planning and user stories` | Se documenta Sprint Goal, tareas y criterios. |
| 3 | `docs: add heuristic evaluation findings` | Se agregan 10 problemas UX clasificados. |
| 4 | `docs: add login wireframes and ux redesign rationale` | Se documentan wireframes Lo-Fi, Mid-Fi y Hi-Fi. |
| 5 | `docs: add implementation and ai evidence` | Se agregan cambios técnicos y evidencia IA. |

## Comandos Git sugeridos

```bash
git add HCI-PruebaFinal/product_backlog.md
git commit -m "docs: add product backlog for hci final test"

git add HCI-PruebaFinal/sprint_planning.md
git commit -m "docs: add sprint planning and user stories"

git add HCI-PruebaFinal/heuristic_evaluation.md
git commit -m "docs: add heuristic evaluation findings"

git add HCI-PruebaFinal/wireframes/wireframes_login.md
git commit -m "docs: add login wireframes and ux redesign rationale"

git add HCI-PruebaFinal/ai_evidence.md HCI-PruebaFinal/implementation/technical_changes.md HCI-PruebaFinal/github_evidence.md
git commit -m "docs: add implementation and ai evidence"
```

## Nota para la entrega
Los commits no deben estar vacíos. Cada commit debe agregar o modificar archivos reales y debe ser visible en el historial del repositorio público.
