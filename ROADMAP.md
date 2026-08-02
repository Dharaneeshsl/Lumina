# Lumina Product Roadmap

> **Last Updated**: August 2026  
> This is a living document. Priorities may shift based on customer feedback, market conditions, and engineering capacity. Subscribe to our [GitHub Discussions](https://github.com/luminohq/lumina/discussions) for real-time roadmap updates.

---

## How We Prioritize

Every item on this roadmap is evaluated against four criteria:

1. **Customer impact** — How many users does this affect? How severe is the pain?
2. **Strategic alignment** — Does this advance our mission of effortless data intelligence?
3. **Engineering effort** — How long will this take to build well?
4. **Revenue potential** — Does this unlock a new market segment or pricing tier?

We actively welcome feedback on our priorities. If something here does not reflect your needs, please open a [GitHub Discussion](https://github.com/luminohq/lumina/discussions) or email **product@luminohq.com**.

---

## ✅ Recently Shipped (Q2 2026)

| Feature | Notes |
|---|---|
| ✅ Real-time WebSocket chart updates | Dashboards now refresh live — no more F5 |
| ✅ PostgreSQL native connector v2 | 10x query performance improvement |
| ✅ Organization teams & roles | Granular permissions per workspace |
| ✅ Slack notification integration | Alert delivery to any Slack channel |
| ✅ CSV/Excel data import | Drag-and-drop file ingestion UI |
| ✅ Dashboard version history | Full diff view with restore capability |
| ✅ Two-factor authentication (TOTP) | TOTP authenticator app support |
| ✅ Row-Level Security (RLS) | Dynamic data filtering by user context |
| ✅ Embed SDK v1 | Embed charts into third-party applications |
| ✅ React Email templates | Beautiful, consistent transactional emails |

---

## 🚧 In Progress (Q3 2026)

| Feature | Status | Target |
|---|---|---|
| **Lumina AI Co-pilot v2** — NLQ with multi-step reasoning | 🔨 In development | Sep 2026 |
| **Anomaly detection engine** — ML-based outlier alerts | 🔨 In development | Aug 2026 |
| **Self-hosted Docker bundle** — single `docker compose up` | 🔨 In development | Sep 2026 |
| **Stripe billing integration** — usage-based billing | 🔨 In development | Aug 2026 |
| **MySQL connector** — native MySQL 8+ support | 🔨 In development | Aug 2026 |
| **WebAuthn passkeys** — passwordless login | 🔬 In design | Sep 2026 |
| **API key management UI** — self-serve API key rotation | 🔬 In design | Sep 2026 |
| **Funnel chart type** — conversion funnel visualization | ✏️ Scoped | Sep 2026 |

---

## 📋 Planned (Q4 2026)

| Feature | Priority | Notes |
|---|---|---|
| **Native mobile apps** (React Native) | 🔴 High | iOS and Android, all dashboard features |
| **Data transformation layer** | 🔴 High | dbt-compatible YAML-based transforms |
| **Multi-cloud replication** | 🟡 Medium | Disaster recovery, geo-redundancy |
| **Snowflake connector** | 🔴 High | Most requested enterprise connector |
| **BigQuery connector** | 🔴 High | Native Google Cloud integration |
| **MongoDB connector** | 🟡 Medium | Document store querying and visualization |
| **Scheduled exports** | 🟡 Medium | Automated PDF/CSV report delivery |
| **Executive dashboard templates** | 🟢 Low | Pre-built CFO, CMO, CTO dashboard packs |
| **Keyboard shortcuts** | 🟢 Low | Power user productivity improvements |
| **Dark mode** | 🟡 Medium | System-aware automatic dark/light switching |
| **SSO — SAML 2.0** | 🔴 High | Enterprise SSO support |
| **SSO — Microsoft Entra** | 🔴 High | Azure AD integration |
| **Full audit log UI** | 🟡 Medium | Searchable audit trail in the dashboard |

---

## 🔭 Future Vision (2027 and Beyond)

These are longer-horizon ideas we are actively thinking about but have not yet committed to:

| Idea | Description |
|---|---|
| **Lumina AI Agents** | Autonomous agents that monitor KPIs and take configurable actions (send alerts, create tickets, update records) |
| **Lumina Marketplace** | Community-built connectors, dashboard templates, and AI prompt packs |
| **HIPAA Certification** | Full HIPAA compliance for healthcare and life sciences customers |
| **Edge-native deployment** | Cloudflare Workers-based deployment for ultra-low latency |
| **Lumina CLI v2** | Full-featured CLI for managing every aspect of your Lumina workspace |
| **Terraform provider** | Manage Lumina resources declaratively as infrastructure-as-code |
| **dbt integration** | First-class support for dbt models, tests, and docs as data sources |
| **Data catalog** | Browse, search, and annotate all your data assets in one place |
| **Column-level lineage** | Trace every calculated metric back to its raw source column |
| **Query versioning** | Git-like version control for your saved queries |
| **Collaborative query editor** | Real-time, multiplayer SQL editor with presence indicators |
| **Native Jupyter integration** | Import and display Jupyter notebook outputs as Lumina charts |
| **Multi-tenancy support** | Built-in multi-tenant architecture for agencies and white-label resellers |

---

## 🙅 Explicitly Not on the Roadmap

The following items have been requested but we have decided not to build them (at least for now):

| Feature | Reason |
|---|---|
| **On-premise/air-gapped installation** | Engineering and support overhead is too high at our current scale. We offer self-hosted Docker instead. |
| **Python SDK** | Our TypeScript SDK covers the vast majority of use cases. We may revisit if demand grows significantly. |
| **Built-in ETL pipeline builder** | This would compete with specialized tools (Airbyte, Fivetran) where they have a clear advantage. We integrate with them instead. |
| **Spreadsheet editor inside Lumina** | We integrate with Google Sheets and Excel. Building a spreadsheet editor is a massive product in itself. |

---

## How to Influence the Roadmap

Your input directly shapes what we build. Here is how to make your voice heard:

1. **👍 React to GitHub issues** — upvoting signals demand to our product team
2. **💬 Join GitHub Discussions** — detailed conversations about specific features
3. **📧 Email product@luminohq.com** — for enterprise feature requests or strategic feedback
4. **💬 Discord** — join `#feature-requests` in our [Discord community](https://discord.gg/lumina)
5. **📞 Schedule a call** — enterprise customers can book a product review call via their account manager

---

*Lumina · Built with love · [luminohq.com](https://luminohq.com)*
