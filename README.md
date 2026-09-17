BeforeItFades
BeforeItFades is an evidence-preservation early-warning prototype for authorized court staff and legal-aid teams.

It helps reviewers identify case evidence that may become unavailable before a pending hearing. The prototype connects each signal to its source record, shows a simple 30/90/180-day scenario view, and turns review signals into a human-controlled preservation checklist.

BeforeItFades does not decide the case. It protects the case from time.

What is included
Interactive evidence risk radar
Seeded synthetic road-accident case
Today, 30-day, 90-day, and 180-day scenario views
Source-linked explanations with explicit uncertainty
Evidence library workspace
Human-review preservation checklist
Provenance and review-history panel
Responsive desktop and mobile layout
Safety boundary
This is a decision-support prototype. It does not provide legal advice, predict guilt or innocence, score witness credibility, predict a judgment, recommend an order, or send preservation requests automatically. The included case data is synthetic and intended only for demonstration.

Run locally
Requirements: Node.js 20+ and pnpm.

pnpm install
pnpm dev
Open the local URL printed by Vite. The production build can be checked with:

pnpm check
pnpm build
Project structure
client/
  src/
    pages/Home.tsx       # Main product workflow and demo data
    App.tsx              # Application shell
    index.css            # Design tokens and visual system
    components/ui/       # Shared shadcn/ui primitives
server/                  # Static-template compatibility server
shared/                  # Shared template constants
Next production steps
A production pilot would add role-based authentication, secure document storage, real document ingestion, configurable jurisdiction-specific rules, persistent audit records, and a formal security and privacy review.

License
Prototype code for hackathon evaluation. Add the project’s chosen license before public distribution.
