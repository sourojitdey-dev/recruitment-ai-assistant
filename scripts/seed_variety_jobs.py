import sys
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.company import Company
from app.models.job import Job
from app.models.user import User
from app.services.vector_store import index_job

def seed_variety_jobs():
    db = SessionLocal()
    try:
        print("--- Starting Job Seeding for All 4 Companies ---")

        # 1. Verify Companies
        companies_map = {}
        for c in db.query(Company).filter(Company.id.in_([1, 2, 3, 4])).all():
            companies_map[c.id] = c
            print(f"Found Company: ID {c.id} -> {c.name}")

        if not companies_map:
            print("ERROR: Companies 1, 2, 3, 4 not found in database.")
            return

        # 2. Ensure Recruiters exist for each company
        recruiters_map = {}
        for comp_id, comp in companies_map.items():
            recruiter = (
                db.query(User)
                .filter(User.company_id == comp_id, User.role == "recruiter")
                .first()
            )
            if not recruiter:
                # Create a default recruiter for this company
                rec_email = f"recruiter.{comp.name.lower().replace(' ', '')}@test.com"
                recruiter = User(
                    name=f"{comp.name} Talent Recruiter",
                    email=rec_email,
                    password_hash=hash_password("Recruiter@123"),
                    role="recruiter",
                    company_id=comp_id,
                    is_active=True,
                )
                db.add(recruiter)
                db.commit()
                db.refresh(recruiter)
                print(f"Created recruiter user for {comp.name}: {rec_email} (ID: {recruiter.id})")
            else:
                print(f"Using existing recruiter for {comp.name}: {recruiter.email} (ID: {recruiter.id})")
            recruiters_map[comp_id] = recruiter

        # 3. Define curated, diverse jobs for each company
        jobs_data = [
            # Google (ID: 1)
            {
                "company_id": 1,
                "title": "Staff Machine Learning Engineer (LLMs & RAG)",
                "location": "Mountain View, CA (Hybrid)",
                "description": (
                    "Join Google DeepMind & Core AI teams to architect next-generation large language model (LLM) "
                    "applications, retrieval-augmented generation (RAG) pipelines, and multimodal inference systems. "
                    "Responsibilities:\n"
                    "- Design high-throughput vector search indexes and embedding similarity algorithms.\n"
                    "- Optimize prompt architectures, fine-tune transformer models, and implement safety guardrails.\n"
                    "- Deploy low-latency inference services handling billions of daily queries.\n"
                    "Requirements:\n"
                    "- 5+ years of experience with Python, PyTorch, JAX, and TensorFlow.\n"
                    "- Deep understanding of dense embeddings, pgvector, FAISS, and transformer architectures.\n"
                    "- Experience building production REST/gRPC microservices with FastAPI or C++."
                ),
            },
            {
                "company_id": 1,
                "title": "Senior Cloud Infrastructure & Site Reliability Engineer (SRE)",
                "location": "Sunnyvale, CA (Remote / Hybrid)",
                "description": (
                    "Google Cloud is seeking a Senior SRE to design, scale, and automate resilient multi-region infrastructure. "
                    "Responsibilities:\n"
                    "- Architect zero-downtime Kubernetes (GKE) clusters and automated CI/CD deployment pipelines.\n"
                    "- Define Infrastructure as Code (IaC) using Terraform, Spinnaker, and Helm charts.\n"
                    "- Lead incident management, chaos engineering, and telemetry with Prometheus, Grafana, and OpenTelemetry.\n"
                    "Requirements:\n"
                    "- Strong programming proficiency in Go or Python.\n"
                    "- Expert knowledge of Linux internals, TCP/IP networking, and distributed cloud architectures.\n"
                    "- Experience with container security, zero-trust networking, and high availability systems."
                ),
            },
            {
                "company_id": 1,
                "title": "Frontend Lead (UI Architecture & Web Performance)",
                "location": "New York, NY (Hybrid)",
                "description": (
                    "Build next-generation responsive web interfaces with state-of-the-art Glassmorphic design systems and blazing fast performance. "
                    "Responsibilities:\n"
                    "- Lead UI component architecture with pure ES6+ JavaScript, TypeScript, and modern CSS3 design tokens.\n"
                    "- Implement real-time interactive dashboards with WebSockets, Charting, and progressive rendering.\n"
                    "- Optimize Core Web Vitals to achieve 95+ performance scores across all devices.\n"
                    "Requirements:\n"
                    "- 4+ years of advanced JavaScript/TypeScript and Single Page Application (SPA) architecture.\n"
                    "- Deep mastery of CSS layout models (Flexbox, CSS Grid, Glassmorphism, animations).\n"
                    "- Passion for web accessibility (WCAG 2.1 AA) and micro-frontend design patterns."
                ),
            },

            # FANG (ID: 2)
            {
                "company_id": 2,
                "title": "Senior Distributed Systems Engineer (Event Streaming)",
                "location": "Seattle, WA (Hybrid)",
                "description": (
                    "Architect and scale ultra-high throughput event streaming backends processing millions of transactions per second. "
                    "Responsibilities:\n"
                    "- Build resilient stream processing pipelines using Apache Kafka, Apache Flink, and Redis clusters.\n"
                    "- Implement distributed consensus mechanisms (Raft, Paxos) and fault-tolerant state stores.\n"
                    "- Benchmark and tune memory allocations, garbage collection, and async I/O bottlenecks.\n"
                    "Requirements:\n"
                    "- 5+ years of experience with Java, Scala, Go, or Rust in high-concurrency environments.\n"
                    "- Solid understanding of distributed databases (Cassandra, ScyllaDB, PostgreSQL).\n"
                    "- Experience with low-latency network protocols (gRPC, Protocol Buffers, HTTP/2)."
                ),
            },
            {
                "company_id": 2,
                "title": "Computer Vision & Edge AI Research Engineer",
                "location": "San Francisco, CA (Remote)",
                "description": (
                    "Develop cutting-edge computer vision models and neural network accelerators for real-time edge devices. "
                    "Responsibilities:\n"
                    "- Train and quantize deep neural networks for object detection, segmentation, and pose tracking.\n"
                    "- Optimize model weights using TensorRT, ONNX Runtime, and INT8 calibration.\n"
                    "- Collaborate with embedded hardware teams to deploy low-power neural inference engines.\n"
                    "Requirements:\n"
                    "- Strong background in Python, C++, PyTorch, and OpenCV.\n"
                    "- Experience with CUDA kernel development and edge devices (NVIDIA Jetson, Apple Neural Engine).\n"
                    "- Publications or proven production track record in vision transformer or CNN deployment."
                ),
            },
            {
                "company_id": 2,
                "title": "Full-Stack Product Engineer (Python & React)",
                "location": "Austin, TX (Remote)",
                "description": (
                    "Own user-facing features from product conception to full production deployment across modern web apps. "
                    "Responsibilities:\n"
                    "- Develop RESTful APIs, background task queues, and data models with FastAPI and PostgreSQL.\n"
                    "- Implement responsive, interactive web interfaces with modern JavaScript and component design systems.\n"
                    "- Write robust automated end-to-end and unit test suites with Pytest and Playwright.\n"
                    "Requirements:\n"
                    "- Proficiency with Python, FastAPI/Flask, PostgreSQL, and SQLAlchemy.\n"
                    "- Hands-on frontend development experience with modern HTML5/CSS3 and React/Vue/Vanilla JS.\n"
                    "- Experience with Docker containerization and cloud CI/CD deployments."
                ),
            },

            # ABC Enterprises (ID: 3)
            {
                "company_id": 3,
                "title": "Principal Enterprise Solutions Architect",
                "location": "Chicago, IL (Hybrid)",
                "description": (
                    "Lead enterprise application modernization, microservice transitions, and digital transformation initiatives. "
                    "Responsibilities:\n"
                    "- Define enterprise-wide architectural standards, API gateway topologies, and cloud migration roadmaps.\n"
                    "- Collaborate with C-level stakeholders, product leaders, and engineering teams to align business goals.\n"
                    "- Design scalable data integration fabrics connecting legacy ERPs with modern cloud platforms.\n"
                    "Requirements:\n"
                    "- 8+ years of software architecture experience in large enterprise environments.\n"
                    "- Deep understanding of domain-driven design (DDD), event-driven microservices, and OAuth2/SAML SSO.\n"
                    "- Proven experience with AWS or Azure cloud migrations."
                ),
            },
            {
                "company_id": 3,
                "title": "Senior Cybersecurity & Compliance Engineer",
                "location": "Atlanta, GA (Remote)",
                "description": (
                    "Safeguard enterprise infrastructure, implement zero-trust security postures, and ensure continuous compliance. "
                    "Responsibilities:\n"
                    "- Implement continuous automated vulnerability scanning, SIEM monitoring, and intrusion detection.\n"
                    "- Audit and enforce SOC2 Type II, ISO 27001, and GDPR regulatory compliance across all services.\n"
                    "- Conduct penetration testing, code security reviews, and secret management enforcement.\n"
                    "Requirements:\n"
                    "- 4+ years of dedicated cybersecurity, SecOps, or cloud security experience.\n"
                    "- Hands-on scripting in Python or Bash for security automation.\n"
                    "- Familiarity with HashiCorp Vault, AWS IAM, WAFs, and container security scanners."
                ),
            },
            {
                "company_id": 3,
                "title": "Lead Data Engineer (ETL & Analytics Platforms)",
                "location": "Dallas, TX (Hybrid)",
                "description": (
                    "Build automated data pipelines, modern data lakehouses, and real-time business intelligence analytics platforms. "
                    "Responsibilities:\n"
                    "- Architect batch and real-time ETL/ELT pipelines using Apache Spark, dbt, and Apache Airflow.\n"
                    "- Model dimensional data warehouses in Snowflake and PostgreSQL for lightning-fast querying.\n"
                    "- Ensure high data quality, lineage tracking, and automated governance.\n"
                    "Requirements:\n"
                    "- Strong Python and advanced SQL skills.\n"
                    "- Experience with Snowflake, BigQuery, or Redshift data warehousing.\n"
                    "- Proven experience orchestrating complex DAGs with Airflow or Dagster."
                ),
            },

            # Microsoft (ID: 4)
            {
                "company_id": 4,
                "title": "Principal AI Platform Software Engineer",
                "location": "Redmond, WA (Hybrid)",
                "description": (
                    "Develop hyperscale AI cloud platforms powering Azure OpenAI Services and Copilot developer ecosystems. "
                    "Responsibilities:\n"
                    "- Build high-concurrency gateway services for LLM model inference, prompt orchestration, and token streaming.\n"
                    "- Integrate vector search indices (pgvector, Azure AI Search) with sub-millisecond retrieval latency.\n"
                    "- Architect scalable multi-tenant quota management, rate limiting, and telemetry.\n"
                    "Requirements:\n"
                    "- 6+ years of software engineering in C#, .NET Core, or Python in large distributed systems.\n"
                    "- Deep familiarity with Azure cloud infrastructure, Azure Kubernetes Service (AKS), and CosmosDB.\n"
                    "- Experience with AI embeddings, RAG architectures, and semantic ranking algorithms."
                ),
            },
            {
                "company_id": 4,
                "title": "Senior DevOps & Cloud Infrastructure Engineer",
                "location": "Boston, MA (Remote)",
                "description": (
                    "Design and automate resilient continuous integration, delivery, and infrastructure systems across Azure. "
                    "Responsibilities:\n"
                    "- Author automated infrastructure scripts with Terraform, Azure Bicep, and ARM templates.\n"
                    "- Build multi-stage Azure DevOps and GitHub Actions CI/CD pipelines with automated security gates.\n"
                    "- Implement centralized logging, metric alerting, and monitoring with Azure Monitor and Log Analytics.\n"
                    "Requirements:\n"
                    "- 4+ years of DevOps/Cloud Engineering experience with Azure.\n"
                    "- Strong scripting in PowerShell, Bash, and Python.\n"
                    "- Hands-on expertise with Docker, Kubernetes, Helm, and Azure Container Apps."
                ),
            },
            {
                "company_id": 4,
                "title": "AI Recruitment & Talent Intelligence Specialist",
                "location": "Seattle, WA (Hybrid)",
                "description": (
                    "Innovate AI-driven recruitment workflows, resume parsing pipelines, and semantic candidate matching platforms. "
                    "Responsibilities:\n"
                    "- Develop backend services for resume feature extraction, skill ontology mapping, and candidate scoring.\n"
                    "- Implement grounded LLM interview generation and real-time WebSocket assistant capabilities.\n"
                    "- Ensure privacy guardrails, advisory disclaimers, and candidate data compliance.\n"
                    "Requirements:\n"
                    "- Strong Python proficiency with FastAPI, SQLAlchemy, and async event handling.\n"
                    "- Experience with sentence transformers, 384-dimensional vector embeddings, and pgvector.\n"
                    "- Familiarity with recruitment pipelines, interview scheduling, and ATS integrations."
                ),
            },
        ]

        created_count = 0
        indexed_count = 0

        for item in jobs_data:
            comp = companies_map[item["company_id"]]
            recruiter = recruiters_map[item["company_id"]]

            # Check if job with this title already exists for this company
            existing = (
                db.query(Job)
                .filter(
                    Job.company_id == comp.id,
                    Job.title == item["title"],
                )
                .first()
            )

            if existing:
                existing.description = item["description"]
                existing.location = item["location"]
                existing.is_active = True
                db.commit()
                db.refresh(existing)
                job_obj = existing
                print(f"Updated existing job #{job_obj.id}: '{job_obj.title}' at {comp.name}")
            else:
                job_obj = Job(
                    title=item["title"],
                    description=item["description"],
                    location=item["location"],
                    company_name=comp.name,
                    company_id=comp.id,
                    is_active=True,
                    recruiter_id=recruiter.id,
                )
                db.add(job_obj)
                db.commit()
                db.refresh(job_obj)
                created_count += 1
                print(f"Created new job #{job_obj.id}: '{job_obj.title}' at {comp.name}")

            # Index job in vector store
            try:
                chunks = index_job(db, job_obj)
                indexed_count += chunks
                print(f"  -> Indexed into vector store ({chunks} chunks)")
            except Exception as e:
                print(f"  -> Vector indexing warning: {e}")

        print("\n==========================================")
        print(f"SUCCESS: Seeded {len(jobs_data)} jobs across all 4 companies!")
        print(f"Total vector chunks generated: {indexed_count}")
        print("==========================================")

    finally:
        db.close()

if __name__ == "__main__":
    seed_variety_jobs()
