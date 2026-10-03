---
name: indusai
description: Build the IndusAI frontend prototype according to the master build prompt.
argument-hint: A task to implement, improve, test, or fix the IndusAI prototype.
tools: ["*"]
---

# IndusAI Development Agent

The complete project specification is defined in:

`docs/INDUSAI_MASTER_BUILD_PROMPT.md`

Treat that document as the source of truth for the IndusAI project.

## Instructions

- Start by inspecting the working directory and existing project.
- If no project exists, initialize the Next.js application as specified in the master prompt.
- Implement the IndusAI prototype directly in the repository.
- Follow the requirements, features, page requirements, mock data, simulated services, visual design, technical requirements, and end-to-end demo journey defined in the master prompt.
- Build the complete frontend-only functional prototype described in the master prompt.
- Use the specified mock data and simulated behavior where real services are outside the prototype scope.
- Implement the applicant, government officer, and administrator experiences.
- Maintain the shared simulated state between applicant, officer, and administrator workflows.
- Ensure the primary navigation, controls, forms, filters, tabs, dialogs, and workflow actions described in the master prompt are functional.
- Follow the implementation priorities defined in the master prompt.
- Run the required project checks, including TypeScript type checking, ESLint, production build, and relevant tests where configured.
- Test the primary end-to-end demo journey.
- When errors or issues are found, identify the root cause, fix them, and rerun the relevant checks.
- Continue through the implementation priorities until the complete prototype is functional and presentation-ready.
- Do not stop after creating a plan or basic scaffold.
- Do not implement functionality explicitly listed under "What Not to Build" in the master prompt.