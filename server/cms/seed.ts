import { 
  createPage,
  createService,
  createTeamMember,
  createMedia,
  saveSiteSettings,
  createAdminUser,
  createAuditLogEntry,
  createBlogPost
} from './db.js';
import type {
  Page,
  Service,
  TeamMember,
  MediaAsset,
  SiteSettings,
  AdminUser,
  BlogPost,
  ContactSubmission
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

  // 6. Create Blog Posts
  const blogPosts: Array<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>> = [
    {
      slug: 'ai-safety-best-practices',
      title: 'AI Safety Best Practices for Enterprise Deployment',
      content: `
<p>As AI systems become increasingly integrated into critical business processes, ensuring their safe and reliable operation is paramount. This post outlines key best practices for enterprise AI deployment.</p>

<h2>Comprehensive Testing Frameworks</h2>

<p>Before deploying any AI system in production, it's essential to establish rigorous testing protocols that evaluate:</p>

<ul>
  <li><strong>Output Quality:</strong> Systematically verify that AI-generated content meets quality standards across various inputs</li>
  <li><strong>Edge Cases:</strong> Test with unusual or boundary inputs to identify potential failure modes</li>
  <li><strong>Adversarial Scenarios:</strong> Attempt to deliberately cause failures or undesirable outputs</li>
  <li><strong>Compliance:</strong> Ensure outputs adhere to regulatory requirements and ethical guidelines</li>
</ul>

<h2>Human Oversight Integration</h2>

<p>Even the most advanced AI systems benefit from human supervision:</p>

<ul>
  <li>Implement clear escalation paths for uncertain or high-risk decisions</li>
  <li>Establish feedback loops where human experts can correct AI errors</li>
  <li>Maintain comprehensive audit trails of AI decisions and human interventions</li>
</ul>

<h2>Continuous Monitoring</h2>

<p>AI safety isn't a one-time effort but requires ongoing vigilance:</p>

<ul>
  <li>Monitor performance metrics to detect degradation over time</li>
  <li>Track input distribution shifts that might affect model performance</li>
  <li>Implement alerting systems for anomalous behavior</li>
</ul>

<p>By following these best practices, organizations can harness the power of AI while minimizing associated risks.</p>
      `,
      excerpt: 'Essential guidelines for safely deploying AI systems in enterprise environments, focusing on testing frameworks, human oversight, and continuous monitoring.',
      author: 'team_1', // Will be linked to Alex Rodriguez
      categories: ['AI Safety', 'Enterprise', 'Best Practices'],
      tags: ['testing', 'monitoring', 'deployment', 'oversight'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      seo: {
        title: 'AI Safety Best Practices for Enterprise Deployment | Generativ Consulting',
        description: 'Learn essential guidelines for safely deploying AI systems in enterprise environments, focusing on testing frameworks, human oversight, and continuous monitoring.',
        keywords: ['AI safety', 'enterprise AI', 'AI testing', 'AI deployment']
      }
    },
    {
      slug: 'parallelization-techniques',
      title: '10x Your AI Workflow with Advanced Parallelization Techniques',
      content: `
<p>In today's competitive landscape, the speed at which you can deploy and iterate on AI solutions can be a decisive advantage. This post explores practical techniques for parallelizing AI workflows to achieve dramatic performance improvements.</p>

<h2>Workflow Analysis</h2>

<p>Before implementing parallelization strategies, it's crucial to understand your current workflow:</p>

<ul>
  <li>Identify bottlenecks through systematic profiling</li>
  <li>Determine which processes can run independently</li>
  <li>Map data dependencies between workflow stages</li>
</ul>

<h2>Effective Parallelization Strategies</h2>

<p>Once you've analyzed your workflow, consider these parallelization approaches:</p>

<h3>1. Data Parallelism</h3>

<p>Process multiple data batches simultaneously across different compute resources. This approach is particularly effective for:</p>

<ul>
  <li>Batch inference tasks</li>
  <li>Large-scale data preprocessing</li>
  <li>Independent validation runs</li>
</ul>

<h3>2. Model Parallelism</h3>

<p>Distribute different parts of your model across multiple devices:</p>

<ul>
  <li>Shard large models across GPUs</li>
  <li>Run ensemble components in parallel</li>
  <li>Pipeline model stages for continuous processing</li>
</ul>

<h3>3. Task Parallelism</h3>

<p>Execute different workflow components simultaneously:</p>

<ul>
  <li>Run data preprocessing alongside model training</li>
  <li>Perform hyperparameter tuning in parallel</li>
  <li>Simultaneously evaluate multiple model variants</li>
</ul>

<h2>Implementation Considerations</h2>

<p>When implementing parallelization:</p>

<ul>
  <li>Balance resource allocation to prevent bottlenecks</li>
  <li>Implement efficient synchronization mechanisms</li>
  <li>Consider communication overhead in distributed systems</li>
  <li>Establish monitoring to identify optimization opportunities</li>
</ul>

<p>By thoughtfully applying these parallelization techniques, organizations can achieve dramatic improvements in AI workflow efficiency, often reaching 10x or greater speedups compared to sequential processing approaches.</p>
      `,
      excerpt: 'Practical techniques for parallelizing AI workflows to achieve dramatic performance improvements through data, model, and task parallelism.',
      author: 'team_2', // Will be linked to Jamie Lee
      categories: ['Performance Optimization', 'Infrastructure', 'Workflows'],
      tags: ['parallelization', 'performance', 'optimization', 'scaling'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      seo: {
        title: '10x Your AI Workflow with Advanced Parallelization Techniques | Generativ Consulting',
        description: 'Learn practical techniques for parallelizing AI workflows to achieve dramatic performance improvements through data, model, and task parallelism.',
        keywords: ['AI parallelization', 'workflow optimization', 'performance scaling', 'AI infrastructure']
      }
    },
    {
      slug: 'critical-thinking-ai-era',
      title: 'Critical Thinking in the AI Era: Essential Skills for the Modern Workforce',
      content: `
<p>As AI systems become increasingly integrated into workplace processes, the ability to think critically about AI outputs is becoming an essential professional skill. This post explores key critical thinking competencies needed in the AI era.</p>

<h2>Understanding AI Capabilities and Limitations</h2>

<p>Effective collaboration with AI tools begins with a clear understanding of what they can and cannot do:</p>

<ul>
  <li>Recognize the types of tasks where AI excels and where it struggles</li>
  <li>Understand the concept of AI hallucinations and when they're likely to occur</li>
  <li>Identify signs that an AI system is operating outside its training domain</li>
</ul>

<h2>Prompt Engineering Literacy</h2>

<p>The ability to effectively instruct AI systems is becoming a fundamental workplace skill:</p>

<ul>
  <li>Craft clear, specific prompts that guide AI toward desired outputs</li>
  <li>Break complex tasks into manageable components</li>
  <li>Iterate on prompts based on system responses</li>
  <li>Understand how context and framing affect AI outputs</li>
</ul>

<h2>Output Evaluation Skills</h2>

<p>Perhaps most crucial is the ability to critically evaluate AI-generated content:</p>

<ul>
  <li>Verify factual claims against reliable sources</li>
  <li>Identify logical inconsistencies or flawed reasoning</li>
  <li>Detect subtle biases in AI-generated content</li>
  <li>Assess whether outputs actually address the original objective</li>
</ul>

<h2>Refinement Techniques</h2>

<p>Beyond evaluation, professionals need skills to improve AI outputs:</p>

<ul>
  <li>Provide effective feedback to guide AI systems toward better results</li>
  <li>Edit and enhance AI-generated content</li>
  <li>Combine outputs from multiple prompts or systems</li>
  <li>Know when to abandon an AI approach in favor of human expertise</li>
</ul>

<h2>Developing Critical Thinking Skills</h2>

<p>Organizations can foster these critical thinking skills through:</p>

<ul>
  <li>Structured training programs focused on AI collaboration</li>
  <li>Regular practice with diverse AI systems and tasks</li>
  <li>Team review sessions to share effective approaches</li>
  <li>Creating a culture that values thoughtful AI use over blind acceptance</li>
</ul>

<p>By developing these critical thinking skills, professionals can transform AI from a potential source of misinformation into a powerful tool that enhances their work while maintaining human judgment at the core of important decisions.</p>
      `,
      excerpt: 'Essential critical thinking skills for effectively working with AI systems, including prompt engineering, output evaluation, and refinement techniques.',
      author: 'team_3', // Will be linked to Morgan Chen
      categories: ['Critical Thinking', 'Professional Development', 'AI Literacy'],
      tags: ['critical thinking', 'prompt engineering', 'AI literacy', 'workforce skills'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
      seo: {
        title: 'Critical Thinking in the AI Era: Essential Skills for the Modern Workforce | Generativ Consulting',
        description: 'Learn the essential critical thinking skills needed to effectively work with AI systems, including prompt engineering, output evaluation, and refinement techniques.',
        keywords: ['critical thinking', 'AI literacy', 'prompt engineering', 'workforce skills']
      }
    }
  ];

  for (const post of blogPosts) {
    await createBlogPost(post);
  }
  console.log('Blog posts created');

  // 7. Create Admin User - First create the regular user account
  console.log('Creating admin user account...');
  
  // Import the user creation function from the regular DB
  const { createUser, getUserByEmail } = await import('../actions/db.js');
  
  // Check if admin user already exists
  let adminUserId: string;
  const existingAdmin = await getUserByEmail('admin@generativ.cc');
  
  if (existingAdmin) {
    console.log('Admin user already exists, using existing ID:', existingAdmin.id);
    adminUserId = existingAdmin.id;
  } else {
    // Hash the admin password
    const crypto = await import('crypto');
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync('admin123', salt, 10000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${hash}`;
    
    // Create the admin user in the regular users table
    adminUserId = await createUser('admin@generativ.cc', passwordHash);
    console.log('Admin user account created with ID:', adminUserId);
  }
  
  // Create the CMS admin user entry (check if exists first)
  const { getAdminUser } = await import('./db.js');
  const existingCMSAdmin = await getAdminUser(adminUserId);
  
  if (!existingCMSAdmin) {
    const adminUser: Omit<AdminUser, 'lastLogin' | 'createdAt' | 'updatedAt'> = {
      userId: adminUserId,
      role: 'admin',
      permissions: ['create', 'update', 'delete', 'publish']
    };

    await createAdminUser(adminUser.userId, adminUser.role, adminUser.permissions);
    console.log('CMS admin user created');
  } else {
    console.log('CMS admin user already exists');
  }

  // 8. Create Audit Log Entries
  await createAuditLogEntry(adminUserId, 'create', 'site_settings', 'site_settings', { action: 'Initial setup' });
  await createAuditLogEntry(adminUserId, 'create', 'page', 'home', { title: 'Home Page' });
  await createAuditLogEntry(adminUserId, 'create', 'page', 'about', { title: 'About Page' });
  await createAuditLogEntry(adminUserId, 'create', 'service', 'safety-testing', { title: 'AI Safety Testing' });
  await createAuditLogEntry(adminUserId, 'create', 'service', 'parallelization', { title: 'Parallelization Infrastructure' });
  await createAuditLogEntry(adminUserId, 'create', 'service', 'critical-thinking', { title: 'Critical Thinking Education' });
  console.log('Audit log entries created');

  console.log('CMS data seeding completed');
}
