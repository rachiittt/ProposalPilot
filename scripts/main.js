// ===================================
// ProposalPilot — Main Application JS
// ===================================

// --- Navbar scroll effect ---
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});

// --- Smooth scroll ---
function scrollToGenerator() {
  const el = document.getElementById('generator');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// --- Counter animation ---
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * easeProgress);
      counter.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  });
}

// Intersection Observer for counter animation
const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.disconnect();
      }
    });
  },
  { threshold: 0.5 }
);

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  statsObserver.observe(heroStats);
}

// --- Scroll-triggered animations ---
const fadeElements = document.querySelectorAll('.feature-card, .step, .pricing-card, .testimonial-card, .oss-card');
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

fadeElements.forEach((el, index) => {
  el.style.opacity = '0';
  el.style.animationDelay = `${index * 0.05}s`;
  fadeObserver.observe(el);
});

// --- Platform pills ---
const platformPills = document.querySelectorAll('.platform-pill');
platformPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    platformPills.forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
  });
});

// --- Proposal Generation ---
const PROPOSAL_TEMPLATES = {
  upwork: {
    opener: 'Hi {clientName},',
    structure: 'upwork',
    closing: 'I\'d love to discuss this further. When\'s a good time for a quick call?',
  },
  fiverr: {
    opener: 'Hello!',
    structure: 'fiverr',
    closing: 'Feel free to message me if you have any questions. I\'m ready to start right away!',
  },
  direct: {
    opener: 'Dear {clientName},',
    structure: 'direct',
    closing: 'I\'ve attached my portfolio for reference. Looking forward to hearing from you.',
  },
  toptal: {
    opener: 'Hello,',
    structure: 'toptal',
    closing: 'I\'m available for an introductory call at your convenience.',
  },
};

async function generateProposal() {
  const jobDesc = document.getElementById('job-description').value.trim();
  if (!jobDesc) {
    showToast('Please enter a job description first!');
    document.getElementById('job-description').focus();
    return;
  }

  const btn = document.getElementById('generate-btn');
  const outputEmpty = document.getElementById('output-empty');
  const outputResult = document.getElementById('output-result');
  const outputBody = document.getElementById('output-body');

  // Get form values
  const platform = document.querySelector('.platform-pill.active')?.dataset.platform || 'upwork';
  const expertise = document.getElementById('your-expertise').value.trim();
  const rate = document.getElementById('your-rate').value.trim();
  const name = document.getElementById('your-name').value.trim() || 'a skilled professional';
  const tone = document.getElementById('tone-select').value;
  const portfolio = document.getElementById('portfolio-link').value.trim();

  // Show loading
  btn.classList.add('loading');
  btn.disabled = true;

  const startTime = performance.now();

  try {
    // Try API first, fall back to local generation
    let proposalText;
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jobDesc,
          platform,
          expertise,
          rate,
          name,
          tone,
          portfolio,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        proposalText = data.proposal;
      } else {
        throw new Error('API not available');
      }
    } catch (apiError) {
      // Fall back to intelligent local generation
      proposalText = generateLocalProposal({
        jobDescription: jobDesc,
        platform,
        expertise,
        rate,
        name,
        tone,
        portfolio,
      });
    }

    // Show result with typing effect
    outputEmpty.style.display = 'none';
    outputResult.style.display = 'flex';
    outputBody.innerHTML = '';

    await typeText(outputBody, proposalText);

    // Update meta
    const endTime = performance.now();
    const wordCount = proposalText.split(/\s+/).length;
    document.getElementById('word-count').innerHTML = `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3h10M2 7h7M2 11h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      ${wordCount} words
    `;
    document.getElementById('gen-time').innerHTML = `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M7 4v3l2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      Generated in ${((endTime - startTime) / 1000).toFixed(1)}s
    `;
  } catch (error) {
    showToast('Something went wrong. Please try again.');
    console.error('Generation error:', error);
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

// --- Typing animation ---
async function typeText(element, text, speed = 8) {
  return new Promise((resolve) => {
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    element.appendChild(cursor);

    function type() {
      if (i < text.length) {
        // Insert text before cursor
        const textNode = document.createTextNode(text[i]);
        element.insertBefore(textNode, cursor);
        i++;

        // Vary speed slightly for naturalness
        const nextSpeed = speed + Math.random() * 4;
        setTimeout(type, text[i - 1] === '\n' ? nextSpeed * 4 : nextSpeed);
      } else {
        // Remove cursor after a moment
        setTimeout(() => {
          cursor.remove();
          resolve();
        }, 1000);
      }
    }
    type();
  });
}

// --- Local proposal generation (fallback) ---
function generateLocalProposal({ jobDescription, platform, expertise, rate, name, tone, portfolio }) {
  // Extract key info from job description
  const keywords = extractKeywords(jobDescription);
  const projectType = detectProjectType(jobDescription);
  const budget = extractBudget(jobDescription);
  const timeline = extractTimeline(jobDescription);

  const toneMap = {
    professional: { greeting: 'I hope this message finds you well.', adjective: 'strong', verb: 'deliver' },
    friendly: { greeting: 'Thanks for posting this — it caught my eye right away!', adjective: 'great', verb: 'build' },
    confident: { greeting: 'This is exactly the kind of project I specialize in.', adjective: 'proven', verb: 'execute' },
    consultative: { greeting: 'I\'ve reviewed your requirements carefully and have some thoughts to share.', adjective: 'strategic', verb: 'architect' },
  };

  const toneStyle = toneMap[tone] || toneMap.professional;
  const template = PROPOSAL_TEMPLATES[platform] || PROPOSAL_TEMPLATES.upwork;

  // Build the proposal
  let proposal = '';

  // Greeting
  const clientName = extractClientName(jobDescription) || 'there';
  proposal += template.opener.replace('{clientName}', clientName) + '\n\n';

  // Hook
  proposal += toneStyle.greeting + '\n\n';

  // Understanding their needs
  proposal += `After reading through your ${projectType} requirements, I can see you need someone who can ${toneStyle.verb} a solution that ${getProjectGoal(keywords, jobDescription)}. I want you to know — I've done exactly this kind of work before, and I understand the nuances involved.\n\n`;

  // Your value proposition
  if (expertise) {
    proposal += `Here's what I bring to the table: ${expertise}. `;
  } else {
    proposal += `Here's what I bring to the table: deep experience in ${keywords.slice(0, 3).join(', ')}. `;
  }
  proposal += `Over the years, I've developed a ${toneStyle.adjective} track record of delivering projects that don't just meet specifications — they exceed expectations.\n\n`;

  // Approach
  proposal += `**My Approach:**\n`;
  proposal += `1. **Discovery** — I'll start by clarifying requirements and edge cases with you, so there are no surprises mid-project.\n`;
  proposal += `2. **Implementation** — Clean, maintainable code with regular progress updates. You'll always know where things stand.\n`;
  proposal += `3. **Testing & QA** — Thorough testing before each delivery to ensure quality.\n`;
  proposal += `4. **Delivery & Support** — Post-delivery support to make sure everything runs smoothly.\n\n`;

  // Timeline and rate
  if (timeline) {
    proposal += `Based on the scope, I estimate this will take approximately ${timeline}. `;
  }
  if (rate) {
    proposal += `My rate for this type of work is ${rate}, which includes all revisions within scope.`;
  } else if (budget) {
    proposal += `Your budget of ${budget} is reasonable for the scope described, and I can work within it.`;
  }
  proposal += '\n\n';

  // Portfolio
  if (portfolio) {
    proposal += `You can see examples of my relevant work here: ${portfolio}\n\n`;
  }

  // Closing
  proposal += template.closing + '\n\n';

  // Sign off
  proposal += `Best regards,\n${name !== 'a skilled professional' ? name : 'Your Name'}`;

  return proposal;
}

function extractKeywords(text) {
  const techTerms = [
    'react', 'vue', 'angular', 'node', 'python', 'javascript', 'typescript',
    'css', 'html', 'api', 'rest', 'graphql', 'database', 'sql', 'mongodb',
    'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'ci/cd', 'devops',
    'machine learning', 'ai', 'data', 'analytics', 'dashboard', 'mobile',
    'ios', 'android', 'flutter', 'react native', 'wordpress', 'shopify',
    'e-commerce', 'saas', 'backend', 'frontend', 'full-stack', 'fullstack',
    'd3', 'chart', 'visualization', 'responsive', 'figma', 'design',
    'ux', 'ui', 'seo', 'performance', 'security', 'authentication',
    'payment', 'stripe', 'firebase', 'supabase', 'next.js', 'tailwind',
    'rust', 'go', 'java', 'c#', '.net', 'php', 'laravel', 'django', 'flask',
  ];

  const lower = text.toLowerCase();
  return techTerms.filter((term) => lower.includes(term));
}

function detectProjectType(text) {
  const lower = text.toLowerCase();
  if (lower.includes('website') || lower.includes('web app')) return 'web application';
  if (lower.includes('mobile app') || lower.includes('ios') || lower.includes('android')) return 'mobile application';
  if (lower.includes('api') || lower.includes('backend')) return 'backend/API';
  if (lower.includes('dashboard')) return 'dashboard';
  if (lower.includes('e-commerce') || lower.includes('store') || lower.includes('shop')) return 'e-commerce';
  if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) return 'design';
  if (lower.includes('data') || lower.includes('analytics')) return 'data/analytics';
  return 'project';
}

function extractBudget(text) {
  const match = text.match(/\$[\d,]+(?:\s*[-–]\s*\$?[\d,]+)?/);
  return match ? match[0] : null;
}

function extractTimeline(text) {
  const match = text.match(/(\d+)\s*(weeks?|months?|days?)/i);
  return match ? match[0] : null;
}

function extractClientName(text) {
  const match = text.match(/(?:I'm|I am|my name is|this is)\s+([A-Z][a-z]+)/);
  return match ? match[1] : null;
}

function getProjectGoal(keywords, text) {
  if (keywords.includes('dashboard')) return 'provides clear, actionable data visualization';
  if (keywords.includes('e-commerce')) return 'drives conversions and provides a seamless buying experience';
  if (keywords.includes('api')) return 'is robust, well-documented, and scalable';
  if (keywords.includes('mobile')) return 'delivers a native-quality experience across devices';
  if (keywords.includes('design')) return 'is both beautiful and intuitive for end users';
  if (keywords.includes('ai') || keywords.includes('machine learning')) return 'leverages intelligent automation effectively';
  return 'meets your business objectives while being maintainable long-term';
}

// --- Copy to clipboard ---
async function copyProposal() {
  const body = document.getElementById('output-body');
  const text = body.innerText;
  try {
    await navigator.clipboard.writeText(text);
    showToast('Proposal copied to clipboard! 📋');
  } catch (err) {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Proposal copied to clipboard! 📋');
  }
}

// --- Toast notification ---
function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto-remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- Interactive mouse glow effect ---
document.addEventListener('mousemove', (e) => {
  const cards = document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card');
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// Add subtle glow on hover
const glowCards = document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card');
glowCards.forEach((card) => {
  card.addEventListener('mouseenter', () => {
    card.style.background = `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.06), transparent 40%), var(--bg-card)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});

// --- Keyboard shortcut ---
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to generate
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    generateProposal();
  }
});

console.log(
  '%c🚀 ProposalPilot %c— Open-source AI proposals for freelancers',
  'background: linear-gradient(135deg, #6366f1, #a78bfa); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
  'color: #a0a0bc; padding: 4px;'
);
