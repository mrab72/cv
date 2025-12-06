'use client'
import { Button } from "@/components/ui/button"
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function Resume() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-900 text-white py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="text-2xl font-bold">Maryam Abdoli</div>
        <nav className="hidden md:flex gap-6">
          <a className="hover:underline" href="#about">
            About
          </a>
          <a className="hover:underline" href="#projects">
            Experience
          </a>
          <a className="hover:underline" href="#story">
            Story
          </a>
          <a className="hover:underline" href="/tech-notes">
            Tech Notes
          </a>
          <a className="hover:underline" href="#contact">
            Contact
          </a>
        </nav>
        <Button className="md:hidden" size="icon" variant="outline">
          <MenuIcon className="h-6 w-6" />
        </Button>
      </header>
      <main className="flex-1">
        <section
          className="bg-gray-900 text-white py-20 px-6 md:px-12 flex flex-col items-center justify-center"
          id="hero"
        >
          <h1 className="text-4xl font-bold mb-4">Welcome to my Portfolio</h1>
          <p className="text-lg mb-8 text-center max-w-3xl">
            Hi, I&apos;m Maryam, a Senior Software Engineer with over 7 years of experience building secure, scalable, 
            event-driven systems and cloud-native applications using Python, Golang, and Rust.
          </p>
          <div className="flex gap-4">
            <a
              className="inline-flex h-10 items-center justify-center rounded-md bg-white px-6 text-sm font-medium text-gray-900 shadow transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
              href="#projects"
            >
              View Experience
            </a>
            <a
              className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 border-white px-6 text-sm font-medium text-white shadow transition-colors hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800"
              href="#contact"
            >
              Contact Me
            </a>
          </div>
        </section>
        <section className="py-12 px-6 md:px-12" id="about">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">About Me</h2>
            <p className="text-lg mb-6">
              I am a Senior Software Engineer with over 7 years of experience specializing in backend development, 
              cloud-native architectures, and event-driven systems. My expertise spans multiple programming languages 
              including Python (6+ years), Golang (4+ years), and Rust (3+ years).
            </p>
            <p className="text-lg mb-6">
              I have extensive experience designing and implementing microservices architectures, working with 
              Kubernetes and Docker for container orchestration, and deploying infrastructure using Terraform. 
              My database expertise includes MongoDB, PostgreSQL, Redis, and event streaming with Kafka.
            </p>
            
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4">Technical Skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Languages</h4>
                  <p className="text-gray-700">Python (6+ years), Golang (4+ years), Rust (3+ years), Java</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Databases & Streaming</h4>
                  <p className="text-gray-700">MongoDB, PostgreSQL, Kafka, Redis</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Web & Microservices</h4>
                  <p className="text-gray-700">actix-web, tokio, gin-gonic, Django, Flask, REST API, WebSocket</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Cloud & DevOps</h4>
                  <p className="text-gray-700">Azure, Kubernetes, Docker, Terraform, Helm, CI/CD, AWS, GCP</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">AI Tools</h4>
                  <p className="text-gray-700">MCP Protocol, Langchain, Langflow, llamaIndex</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4">Education</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">MSc in Communication Networks</h4>
                  <p className="text-gray-700">University of Tehran, Electrical and Computer Engineering</p>
                  <p className="text-gray-600 text-sm">Sep 2017 - Sep 2020</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Bachelor of Engineering in Electrical and Electronics</h4>
                  <p className="text-gray-700">Sharif University of Technology</p>
                  <p className="text-gray-600 text-sm">Sep 2012 - Dec 2016</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-gray-100 py-12 px-6 md:px-12" id="projects">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Professional Experience</h2>
            
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle>Senior Software Engineer</CardTitle>
                    <span className="text-sm text-gray-600">Nov 2021 - Present</span>
                  </div>
                  <CardDescription className="text-base font-semibold">Syntax.com - Montreal, Canada</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">Event-Driven Diagnostics Platform (EED)</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Designed and implemented an event-driven, cloud-agnostic platform for efficient cloud diagnostics</li>
                    <li>• Developed microservices using Golang (gin-gonic, spf13/go) and Rust (actix-web, tokio) to process events and invoke tasks</li>
                    <li>• Deployed sharded MongoDB for data storage and designed schemas for tracking execution graphs and events</li>
                    <li>• Implemented Kafka as an event broker with custom topics and interfaces for event processing</li>
                    <li>• Deployed and managed Kubernetes cluster in Azure for autoscaling and container orchestration</li>
                    <li>• Utilized Terraform and Helm charts to safely deploy infrastructure including microservices, databases, and GitLab runners</li>
                    <li>• Set up Grafana and Prometheus for cluster monitoring and visualization</li>
                    <li>• Implemented serverless architecture using OpenFaaS, Knative, and Docker</li>
                    <li>• Applied Test-Driven Development (TDD) practices using Rust and Golang testing frameworks</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle>Software Developer</CardTitle>
                    <span className="text-sm text-gray-600">Jan 2021 - Oct 2021</span>
                  </div>
                  <CardDescription className="text-base font-semibold">Ronash.co (Hengam.io) - Tehran, Iran</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">Shopify Applications & Web Development</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Developed Shopify apps including back-in-stock notification features</li>
                    <li>• Implemented auto-deploy pipelines using GitLab-CI and Docker-compose on Azure Virtual Machines</li>
                    <li>• Built web applications using Django framework with customer interaction panels</li>
                    <li>• Utilized PostgreSQL and MongoDB with advanced Django ORM for data querying and manipulation</li>
                    <li>• Automated tasks using Celery for statistics generation and data monitoring</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle>Software Developer</CardTitle>
                    <span className="text-sm text-gray-600">Jul 2018 - Jan 2021</span>
                  </div>
                  <CardDescription className="text-base font-semibold">Ronash.co - Tehran, Iran</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">Astrolabe - Analytics Platform</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Acted as Technical Officer for the Trends product, managing terabytes of data</li>
                    <li>• Worked with Google BigQuery, MongoDB, and Spark for data processing</li>
                    <li>• Deployed and maintained web applications using Ansible on Google Cloud Platform (GCP)</li>
                    <li>• Implemented web applications with Django framework</li>
                    <li>• Managed and enhanced React-based projects, implementing new features and maintenance</li>
                    <li>• Applied TDD practices using pytest and unittest frameworks</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Master&apos;s Thesis Project</CardTitle>
                  <CardDescription className="text-base font-semibold">University of Tehran</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">Internet User Behavior Prediction (TUBP)</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Predicted long-term internet user behavior (up to one month) using usage patterns and activity types</li>
                    <li>• Captured and stored 1 GB/s live traffic in MongoDB using pipelines and Celery</li>
                    <li>• Processed terabytes of data using Python, Redis, Celery, Pandas, and NumPy</li>
                    <li>• Implemented machine learning models including LSTM and CNN for predictive analysis</li>
                    <li>• Deployed using Docker-compose and CI/CD pipelines</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="py-12 px-6 md:px-12" id="story">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">My Story</h2>
            <div className="prose prose-lg dark:prose-invert">
              <h3>From Dream to Career</h3>
              <p>
                When I look back, I realize how much I have evolved. With a background in electrical engineering 
                from Sharif University of Technology, I began my career as an FPGA developer and worked in that 
                field for two years. Six years ago, driven by my long-standing passion for computer science—a 
                fascination that started when I was just 10 years old—I decided to switch fields and pursue a 
                career in software development. This transition began during my master&apos;s studies at the University 
                of Tehran, where I worked on an AI-based project that reignited my childhood dream.
              </p>
              <p>
                My journey into software development truly began when I was working as a data scientist intern. 
                I expressed my interest in software development to my employer, and they graciously allowed me 
                to participate as a junior Python developer. This opportunity was pivotal; I received invaluable 
                support and a clear path for growth, eventually becoming a software developer and even leading a 
                team for one of the company&apos;s products.
              </p>
              <h3>Embracing the Challenge</h3>
              <p>
                After immigrating to Canada, I expanded my experience into the cloud domain at Syntax.com, where 
                I work as a Senior Software Engineer. This opened up a new world of opportunities in cloud-native 
                architectures, Kubernetes orchestration, and event-driven systems. For me, programming is akin to 
                solving puzzles. I thrive on the challenge of having my mind engaged in finding ways to fit different 
                pieces together to solve problems. This passion for problem-solving is why I love what I do.
              </p>
            </div>
          </div>
        </section>
        <section className="bg-gray-100 py-12 px-6 md:px-12" id="contact">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Contact Me</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-lg mb-4">
                  Feel free to reach out to me if you have any questions or would like to discuss a project.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MailIcon className="h-5 w-5 text-gray-500" />
                    <a className="text-gray-900 hover:underline" href="mailto:mrab.m.72@gmail.com">
                      mrab.m.72@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-5 w-5 text-gray-500" />
                    <a className="text-gray-900 hover:underline" href="tel:+13439894778">
                      +1 (343) 989-4778
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkedinIcon className="h-5 w-5 text-gray-500" />
                    <a className="text-gray-900 hover:underline" href="https://linkedin.com/in/maryam-abdoli" target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <GithubIcon className="h-5 w-5 text-gray-500" />
                    <a className="text-gray-900 hover:underline" href="https://github.com/mrab72" target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <StackoverflowIcon className="h-5 w-5 text-gray-500" />
                    <a className="text-gray-900 hover:underline" href="https://stackoverflow.com/users/10656093/maryam" target="_blank" rel="noopener noreferrer">
                      Stack Overflow
                    </a>
                  </div>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>
                    Fill out the form below and I will get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Enter your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" placeholder="Enter your email" type="email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea className="min-h-[120px]" id="message" placeholder="Enter your message" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Send Message</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-gray-900 text-white py-6 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm">© 2024 Maryam Abdoli. All rights reserved.</div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a className="hover:underline" href="/tech-notes">
            Tech Notes
          </a>
          <a className="hover:underline" href="https://linkedin.com/in/maryam-abdoli">
            LinkedIn
          </a>
          <a className="hover:underline" href="https://github.com/maryam-abdoli">
            GitHub
          </a>
          <a className="hover:underline" href="mailto:mrab.m.72@gmail.com">
            Email
          </a>
        </div>
      </footer>
    </div>
  )
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function StackoverflowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
