"use strict";

const menuButton = document.getElementById("menu-button");
const navLinks = document.getElementById("nav-links");
const currentYear = document.getElementById("current-year");
const siteHeader = document.querySelector(".site-header");
const cursorGlow = document.getElementById("cursor-glow");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.classList.toggle("open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuButton.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (event) => {
    const clickIsInsideMenu =
      navLinks.contains(event.target) || menuButton.contains(event.target);

    if (!clickIsInsideMenu) {
      navLinks.classList.remove("open");
      menuButton.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

window.addEventListener("scroll", () => {
  if (siteHeader) {
    siteHeader.classList.toggle("scrolled", window.scrollY > 18);
  }
});

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });

  document.addEventListener("mouseleave", () => {
    cursorGlow.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    cursorGlow.style.opacity = "0.18";
  });
}


// Highlight the navigation link for the section currently in view.
const sectionLinks = [...document.querySelectorAll("[data-section-link]")];
const trackedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && trackedSections.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) {
        return;
      }

      sectionLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${visibleEntry.target.id}`
        );
      });
    },
    {
      rootMargin: "-28% 0px -58% 0px",
      threshold: [0.05, 0.2, 0.5],
    }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
}

// Load a small public GitHub profile snapshot.
// The page continues working normally if the API is unavailable.
const repoCount = document.getElementById("repo-count");
const followerCount = document.getElementById("follower-count");
const githubNote = document.getElementById("github-note");

fetch("https://api.github.com/users/ktakyi", {
  headers: {
    Accept: "application/vnd.github+json",
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`GitHub request failed: ${response.status}`);
    }

    return response.json();
  })
  .then((profile) => {
    if (repoCount) {
      repoCount.textContent = profile.public_repos ?? "—";
    }

    if (followerCount) {
      followerCount.textContent = profile.followers ?? "—";
    }

    if (githubNote) {
      githubNote.textContent = "Live public profile values loaded from GitHub.";
    }
  })
  .catch(() => {
    if (githubNote) {
      githubNote.textContent =
        "Live GitHub values are temporarily unavailable. Profile links still work.";
    }
  });

// Lightweight animated network particles.
// Disabled for reduced-motion users and smaller/mobile devices.
const networkCanvas = document.getElementById("network-canvas");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

if (networkCanvas && !reduceMotion && finePointer) {
  const context = networkCanvas.getContext("2d");
  let particles = [];
  let animationFrame;

  const resizeCanvas = () => {
    const deviceScale = Math.min(window.devicePixelRatio || 1, 2);
    networkCanvas.width = window.innerWidth * deviceScale;
    networkCanvas.height = window.innerHeight * deviceScale;
    networkCanvas.style.width = `${window.innerWidth}px`;
    networkCanvas.style.height = `${window.innerHeight}px`;
    context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);

    const particleCount = Math.min(
      55,
      Math.max(24, Math.floor(window.innerWidth / 28))
    );

    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      radius: Math.random() * 1.4 + 0.5,
    }));
  };

  const drawNetwork = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -10) particle.x = window.innerWidth + 10;
      if (particle.x > window.innerWidth + 10) particle.x = -10;
      if (particle.y < -10) particle.y = window.innerHeight + 10;
      if (particle.y > window.innerHeight + 10) particle.y = -10;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(116, 211, 255, 0.68)";
      context.fill();
    });

    for (let index = 0; index < particles.length; index += 1) {
      for (let secondIndex = index + 1; secondIndex < particles.length; secondIndex += 1) {
        const first = particles[index];
        const second = particles[secondIndex];
        const horizontalDistance = first.x - second.x;
        const verticalDistance = first.y - second.y;
        const distance = Math.hypot(horizontalDistance, verticalDistance);

        if (distance < 125) {
          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.strokeStyle = `rgba(50, 182, 255, ${0.14 * (1 - distance / 125)})`;
          context.lineWidth = 0.7;
          context.stroke();
        }
      }
    }

    animationFrame = window.requestAnimationFrame(drawNetwork);
  };

  resizeCanvas();
  drawNetwork();

  window.addEventListener("resize", resizeCanvas);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
    } else {
      drawNetwork();
    }
  });
}


// Subtle alternating telemetry labels in the hero.
const telemetryRows = document.querySelectorAll(".telemetry-row strong");
const telemetryValues = [
  ["Kali Linux", "Linux Lab"],
  ["OpenCanary", "Event Monitor"],
  ["Ollama + Python", "AI Analysis"],
];

if (telemetryRows.length >= 3 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let telemetryIndex = 0;
  window.setInterval(() => {
    telemetryRows.forEach((row, index) => {
      const values = telemetryValues[index] || [];
      row.style.opacity = "0";
      window.setTimeout(() => {
        row.textContent = values[telemetryIndex % values.length];
        row.style.opacity = "1";
      }, 180);
    });
    telemetryIndex += 1;
  }, 4200);
}


// Update the SOC panel clock using the visitor's local time.
const socClock = document.getElementById("soc-clock");

const updateSocClock = () => {
  if (!socClock) {
    return;
  }

  socClock.textContent = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
};

updateSocClock();
window.setInterval(updateSocClock, 1000);
