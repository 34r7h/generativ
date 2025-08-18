import { 
  createPage,
  createService,
  createTeamMember,
  createMedia,
  saveSiteSettings
} from './db.js';
import type {
  Page,
  Service,
  TeamMember,
  MediaAsset,
  SiteSettings
} from './schema';

/**
 * Seed the CMS database with initial content for Generativ Consulting Company
 */
export async function seedCMSData() {
  console.log('Seeding CMS data...');

  // 1. Create site settings
  const siteSettings: Omit<SiteSettings, 'updatedAt'> = {
    siteName: 'Generativ Consulting Company',
    tagline: 'Where AI speed meets human trust',
    contactEmail: 'info@generativ.cc',
    socialLinks: {
      linkedin: 'https://linkedin.com/company/generativ-cc',
      twitter: 'https://twitter.com/generativcc',
      github: 'https://github.com/generativcc'
    },
    footer: {
      copyrightText: `© ${new Date().getFullYear()} Generativ Consulting Company. All rights reserved.`,
      showLogo: true,
      columns: [
        {
          title: 'Services',
          links: [
            { text: 'AI Safety Testing', url: '/services/safety-testing' },
            { text: 'Parallelization', url: '/services/parallelization' },
            { text: 'Critical Thinking', url: '/services/critical-thinking' }
          ]
        },
        {
          title: 'Company',
          links: [
            { text: 'About Us', url: '/about' },
            { text: 'Our Team', url: '/team' },
            { text: 'Contact', url: '/contact' }
          ]
        },
        {
          title: 'Resources',
          links: [
            { text: 'Disruption Radar', url: '/resources/disruption-radar' },
            { text: 'AI Playbook', url: '/resources/playbook' },
            { text: 'Blog', url: '/blog' }
          ]
        }
      ]
    },
    analytics: {
      googleAnalyticsId: 'G-XXXXXXXXXX',
      enableCookieBanner: true
    },
    globalSEO: {
      title: 'Generativ Consulting Company | AI Safety & Performance',
      description: 'The foremost experts in AI safety and performance, accelerating industry progress through rigorous testing, parallelization, and critical-thinking education.',
      keywords: ['AI consulting', 'AI safety', 'AI performance', 'AI testing', 'parallelization', 'critical thinking']
    }
  };
  await saveSiteSettings(siteSettings);
  console.log('Site settings created');

  // 2. Create home page
  const homePage: Omit<Page, 'id' | 'createdAt' | 'updatedAt'> = {
    slug: 'home',
    title: 'Generativ Consulting Company',
    content: 'The foremost experts in AI safety and performance, accelerating industry progress through rigorous testing, parallelization, and critical-thinking education.',
    template: 'home',
    isPublished: true,
    publishedAt: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero',
        title: 'Where AI Speed Meets Human Trust',
        content: 'The foremost experts in AI safety and performance, accelerating industry progress through rigorous testing, parallelization, and critical-thinking education.',
        sortOrder: 1,
        settings: {
          ctaPrimary: {
            text: 'Get Started',
            url: '/contact'
          },
          ctaSecondary: {
            text: 'Explore Services',
            url: '/services'
          }
        }
      },
      {
        id: 'services-overview',
        type: 'services',
        title: 'Our Services',
        content: 'We help organizations navigate AI adoption safely and effectively.',
        sortOrder: 2,
        settings: {}
      },
      {
        id: 'value-prop',
        type: 'content',
        title: 'Navigate AI Disruption With Confidence',
        content: 'In an era where AI adoption determines career trajectories and business outcomes, our expertise ensures you land on the right side of disruption.',
        sortOrder: 3,
        settings: {
          valuePoints: [
            {
              title: 'Testing Frameworks',
              description: 'Comprehensive validation of AI outputs across code, text, and visual content.'
            },
            {
              title: 'Output Acceleration',
              description: '10x productivity through intelligent parallelization techniques.'
            },
            {
              title: 'Risk Mitigation',
              description: 'Identify and address AI vulnerabilities before they impact your business.'
            }
          ],
          ctaText: 'Learn About Our Approach',
          ctaUrl: '/about'
        }
      },
      {
        id: 'team-overview',
        type: 'team',
        title: 'Our Expert Team',
        content: 'Meet the minds behind our innovative approaches to AI safety and performance.',
        sortOrder: 4,
        settings: {
          showMembers: 3,
          ctaText: 'Meet The Full Team',
          ctaUrl: '/team'
        }
      },
      {
        id: 'home-cta',
        type: 'cta',
        title: 'Ready to Bulletproof Your AI Deployment?',
        content: 'Turn disruption from a threat into a career catalyst with our expert guidance.',
        sortOrder: 5,
        settings: {
          ctaPrimary: {
            text: 'Request Free Assessment',
            url: '/contact'
          },
          ctaSecondary: {
            text: 'Read Disruption Radar',
            url: '/resources/disruption-radar'
          }
        }
      }
    ],
    seo: {
      title: 'Generativ Consulting Company | AI Safety & Performance',
      description: 'The foremost experts in AI safety and performance, accelerating industry progress through rigorous testing, parallelization, and critical-thinking education.',
      keywords: ['AI consulting', 'AI safety', 'AI performance', 'AI testing']
    }
  };
  await createPage(homePage);
  console.log('Home page created');

  // 3. Create About page
  const aboutPage: Omit<Page, 'id' | 'createdAt' | 'updatedAt'> = {
    slug: 'about',
    title: 'About Generativ Consulting Company',
    content: 'Learn about our mission to become the foremost experts in AI safety and performance.',
    template: 'about',
    isPublished: true,
    publishedAt: new Date().toISOString(),
    sections: [
      {
        id: 'about-mission',
        type: 'content',
        title: 'Our Mission',
        content: 'Generativ Consulting Company exists to become the foremost experts in AI safety and performance, accelerating industry progress through rigorous testing, parallelization, and critical-thinking education.',
        sortOrder: 1,
        settings: {}
      },
      {
        id: 'about-values',
        type: 'content',
        title: 'Our Core Values',
        content: 'Our values drive everything we do at Generativ Consulting Company.',
        sortOrder: 2,
        settings: {
          values: [
            {
              title: 'Rigor',
              description: 'We approach every challenge with methodical attention to detail, ensuring our solutions are thoroughly tested and validated.',
              icon: '🔍'
            },
            {
              title: 'Innovation',
              description: 'We continuously explore new approaches and technologies to deliver cutting-edge solutions for our clients.',
              icon: '🚀'
            },
            {
              title: 'Partnership',
              description: 'We work alongside our clients as true partners, deeply understanding their needs to deliver tailored solutions.',
              icon: '🤝'
            },
            {
              title: 'Education',
              description: 'We believe in empowering our clients through knowledge transfer and skill building, not just providing solutions.',
              icon: '🧠'
            }
          ]
        }
      },
      {
        id: 'about-approach',
        type: 'content',
        title: 'Our Approach',
        content: 'We follow a methodical process to ensure consistent, high-quality results.',
        sortOrder: 3,
        settings: {
          steps: [
            {
              title: 'Comprehensive Assessment',
              description: 'We begin with a thorough evaluation of your current AI systems, identifying strengths, weaknesses, and opportunities for improvement.'
            },
            {
              title: 'Strategic Planning',
              description: 'Based on our assessment, we develop a tailored roadmap that addresses your specific challenges and aligns with your business objectives.'
            },
            {
              title: 'Implementation',
              description: 'Our experts work alongside your team to implement solutions, ensuring knowledge transfer and building internal capabilities.'
            },
            {
              title: 'Continuous Improvement',
              description: 'We maintain an ongoing relationship, providing support and regularly reassessing your systems as AI technology and your business evolve.'
            }
          ]
        }
      }
    ],
    seo: {
      title: 'About Us | Generativ Consulting Company',
      description: 'Learn about Generativ Consulting Company\'s mission to become the foremost experts in AI safety and performance.',
      keywords: ['about us', 'AI consulting', 'company mission', 'company values']
    }
  };
  await createPage(aboutPage);
  console.log('About page created');

  // 4. Create Services
  const safetyService: Omit<Service, 'id' | 'createdAt' | 'updatedAt'> = {
    slug: 'safety-testing',
    title: 'AI Safety Testing',
    shortDescription: 'Rigorous testing methodologies to ensure your AI systems operate safely and reliably.',
    fullDescription: `
<p>Our AI Safety Testing service provides comprehensive evaluation and verification of your AI systems to ensure they operate reliably, safely, and in alignment with your business objectives.</p>

<p>We employ a suite of advanced testing methodologies specifically designed for machine learning and generative AI models, focusing on identifying potential vulnerabilities, hallucinations, and compliance issues before they impact your business.</p>

<h3>The Agent See Safety Protocol</h3>

<p>Our proprietary testing methodology includes:</p>

<ul>
  <li><strong>Red Team Testing:</strong> Adversarial prompting to uncover potential vulnerabilities</li>
  <li><strong>Output Validation:</strong> Systematic verification of AI-generated content and code</li>
  <li><strong>Compliance Checking:</strong> Ensuring outputs meet regulatory and ethical standards</li>
  <li><strong>Edge Case Analysis:</strong> Stress testing with unusual or boundary inputs</li>
  <li><strong>Continuous Monitoring:</strong> Ongoing evaluation during deployment</li>
</ul>
    `,
    icon: '🔒',
    benefits: [
      'Identify and mitigate hallucination risks',
      'Reduce security vulnerabilities',
      'Ensure compliance with standards and regulations',
      'Improve reliability of AI-generated outputs',
      'Prevent costly errors and brand damage'
    ],
    pricing: 'Starting at $15,000 per assessment',
    isPublished: true,
    sortOrder: 1,
    seo: {
      title: 'AI Safety Testing | Generativ Consulting Company',
      description: 'Comprehensive AI safety testing to ensure your AI systems operate reliably and securely.',
      keywords: ['AI safety', 'AI testing', 'hallucination prevention', 'AI security']
    }
  };
  await createService(safetyService);
  console.log('Safety service created');

  const parallelizationService: Omit<Service, 'id' | 'createdAt' | 'updatedAt'> = {
    slug: 'parallelization',
    title: 'Parallelization Infrastructure',
    shortDescription: 'Speed up your AI workflows with state-of-the-art parallelization techniques and infrastructure.',
    fullDescription: `
<p>Our Parallelization Infrastructure service helps organizations dramatically accelerate their AI workflows through advanced orchestration, batching, and resource optimization strategies.</p>

<p>Whether you're running large language models, training complex neural networks, or processing vast amounts of data, our solutions can help you achieve up to 10x performance improvements while optimizing resource utilization.</p>

<h3>The 10x Output Speed Methodology</h3>

<p>Our approach to parallelization includes:</p>

<ul>
  <li><strong>Workflow Analysis:</strong> Identifying bottlenecks and parallelization opportunities</li>
  <li><strong>Architecture Design:</strong> Creating scalable infrastructure tailored to your needs</li>
  <li><strong>Resource Orchestration:</strong> Intelligent allocation of computing resources</li>
  <li><strong>Batch Processing Systems:</strong> Optimized handling of large-scale workloads</li>
  <li><strong>Performance Monitoring:</strong> Continuous evaluation and tuning</li>
</ul>
    `,
    icon: '⚡',
    benefits: [
      'Accelerate processing times by up to 10x',
      'Reduce infrastructure costs through optimization',
      'Scale seamlessly with demand',
      'Improve team productivity and output',
      'Enable more complex AI applications'
    ],
    pricing: 'Custom pricing based on infrastructure needs',
    isPublished: true,
    sortOrder: 2,
    seo: {
      title: 'Parallelization Infrastructure | Generativ Consulting Company',
      description: 'Speed up your AI workflows with state-of-the-art parallelization techniques and infrastructure.',
      keywords: ['AI parallelization', 'performance optimization', 'distributed systems', 'AI infrastructure']
    }
  };
  await createService(parallelizationService);
  console.log('Parallelization service created');

  const criticalThinkingService: Omit<Service, 'id' | 'createdAt' | 'updatedAt'> = {
    slug: 'critical-thinking',
    title: 'Critical Thinking Education',
    shortDescription: 'Equip your team with the critical thinking skills needed to work effectively with AI systems.',
    fullDescription: `
<p>Our Critical Thinking Education service builds the essential cognitive skills your team needs to effectively evaluate, refine, and leverage AI-generated outputs in your business processes.</p>

<p>As AI becomes increasingly integrated into workflows, the ability to think critically about its outputs becomes a crucial competitive advantage. Our training programs focus on developing practical skills that immediately enhance your team's effectiveness with AI tools.</p>

<h3>The AI Intuition Framework</h3>

<p>Our education programs cover:</p>

<ul>
  <li><strong>Prompt Engineering:</strong> Crafting effective prompts to achieve desired outcomes</li>
  <li><strong>Output Evaluation:</strong> Systematic approaches to assessing AI-generated content</li>
  <li><strong>Error Recognition:</strong> Identifying subtle inaccuracies and hallucinations</li>
  <li><strong>Content Refinement:</strong> Techniques for enhancing and correcting AI outputs</li>
  <li><strong>Ethical Considerations:</strong> Navigating the moral implications of AI use</li>
</ul>
    `,
    icon: '🧠',
    benefits: [
      'Enhance team members\' ability to work effectively with AI',
      'Improve prompt engineering capabilities',
      'Develop failure analysis skills',
      'Reduce dependence on external consultants',
      'Create a culture of responsible AI use'
    ],
    pricing: 'Workshop packages starting at $5,000',
    isPublished: true,
    sortOrder: 3,
    seo: {
      title: 'Critical Thinking Education | Generativ Consulting Company',
      description: 'Equip your team with the critical thinking skills needed to work effectively with AI systems.',
      keywords: ['AI education', 'critical thinking', 'prompt engineering', 'AI literacy']
    }
  };
  await createService(criticalThinkingService);
  console.log('Critical thinking service created');

  // 5. Create Team Members
  const teamMembers: Array<Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>> = [
    {
      name: 'Alex Rodriguez',
      position: 'Chief AI Safety Officer',
      bio: 'Expert in building robust testing frameworks for generative AI models with over 10 years of experience in AI safety research.',
      expertise: ['AI Testing', 'Machine Learning', 'Risk Assessment'],
      email: 'alex@generativ.cc',
      linkedIn: 'https://linkedin.com/in/alex-rodriguez',
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Jamie Lee',
      position: 'Director of Parallelization',
      bio: 'Specializes in architecting high-throughput systems for AI workloads with a background in distributed computing and cloud infrastructure.',
      expertise: ['Distributed Systems', 'Cloud Architecture', 'Performance Optimization'],
      email: 'jamie@generativ.cc',
      linkedIn: 'https://linkedin.com/in/jamie-lee',
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'Morgan Chen',
      position: 'Lead AI Educator',
      bio: 'Designs critical thinking curricula for technical and non-technical teams with a focus on responsible AI use and ethical considerations.',
      expertise: ['AI Education', 'Prompt Engineering', 'Ethical AI'],
      email: 'morgan@generativ.cc',
      linkedIn: 'https://linkedin.com/in/morgan-chen',
      isActive: true,
      sortOrder: 3
    },
    {
      name: 'Taylor Johnson',
      position: 'Operations & Events Manager',
      bio: 'Oversees company operations and coordinates educational events and workshops with a background in project management and corporate education.',
      expertise: ['Operations', 'Event Planning', 'Project Management'],
      email: 'taylor@generativ.cc',
      linkedIn: 'https://linkedin.com/in/taylor-johnson',
      isActive: true,
      sortOrder: 4
    }
  ];

  for (const member of teamMembers) {
    await createTeamMember(member);
  }
  console.log('Team members created');

  console.log('CMS data seeding completed');
}
