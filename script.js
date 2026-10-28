/* ==========================================================
   Intelligent Street Lighting Control System - script.js
   Beginner-friendly JavaScript for the demo website.
   No backend, no hardware: everything uses sample data.
   ========================================================== */

// Wait until the whole page has loaded before running the code
document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setupActiveLinks();
  setupStreetLightControl();
  setupEnergyChart();
  setupContactForm();
});

/* ----------------------------------------------------------
   1. Mobile menu (hamburger button)
   ---------------------------------------------------------- */
function setupMobileMenu() {
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("navMenu");

  toggle.addEventListener("click", function () {
    const isOpen = menu.classList.toggle("open");
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen);
  });

  // Close the menu after a link is clicked on a phone
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ----------------------------------------------------------
   2. Highlight the navigation link for the section on screen
   ---------------------------------------------------------- */
function setupActiveLinks() {
  const links = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section");

  window.addEventListener("scroll", function () {
    let currentId = "home";

    sections.forEach(function (section) {
      // 100px offset so the sticky navbar does not hide the heading
      if (window.scrollY >= section.offsetTop - 100) {
        currentId = section.id;
      }
    });

    links.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + currentId);
    });
  });
}

/* ----------------------------------------------------------
   3. Street light control (ON/OFF, mode, brightness)
   ---------------------------------------------------------- */
const LAMP_COUNT = 24;      // number of lamps in the demo street
const LAMP_WATTS = 120;     // power of one lamp at 100% brightness

// This object stores the current state of the street light
const lightState = {
  power: true,        // true = ON, false = OFF
  brightness: 70,     // 0 to 100
  mode: "auto",       // "auto" or "manual"
  vehicle: false,     // sample sensor value
  pedestrian: false   // sample sensor value
};

let autoTimer = null;  // stores the automatic simulation timer

function setupStreetLightControl() {
  const btnOn = document.getElementById("btnOn");
  const btnOff = document.getElementById("btnOff");
  const btnAuto = document.getElementById("btnAuto");
  const btnManual = document.getElementById("btnManual");
  const slider = document.getElementById("brightness");

  btnOn.addEventListener("click", function () {
    lightState.power = true;
    updateLight();
  });

  btnOff.addEventListener("click", function () {
    lightState.power = false;
    updateLight();
  });

  btnAuto.addEventListener("click", function () {
    setMode("auto");
  });

  btnManual.addEventListener("click", function () {
    setMode("manual");
  });

  // Slider changes brightness (only works in manual mode)
  slider.addEventListener("input", function () {
    lightState.brightness = Number(slider.value);
    updateLight();
  });

  // Start with automatic mode running
  setMode("auto");
}

// Switch between Automatic and Manual mode
function setMode(newMode) {
  lightState.mode = newMode;

  document.getElementById("btnAuto").classList.toggle("active", newMode === "auto");
  document.getElementById("btnManual").classList.toggle("active", newMode === "manual");

  if (newMode === "auto") {
    startAutomaticMode();
  } else {
    stopAutomaticMode();
  }

  updateLight();
}

// Automatic mode: pretend a sensor checks the road every 3 seconds
function startAutomaticMode() {
  stopAutomaticMode();

  autoTimer = setInterval(function () {
    // Random sample readings (about 1 in 3 chance each)
    lightState.vehicle = Math.random() < 0.33;
    lightState.pedestrian = Math.random() < 0.33;

    // Full brightness when someone is detected, otherwise dim to save energy
    if (lightState.vehicle || lightState.pedestrian) {
      lightState.brightness = 100;
    } else {
      lightState.brightness = 30;
    }

    updateLight();
  }, 3000);
}

function stopAutomaticMode() {
  if (autoTimer !== null) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  lightState.vehicle = false;
  lightState.pedestrian = false;
}

// Update every part of the control panel and the energy section
function updateLight() {
  const slider = document.getElementById("brightness");
  const brightnessValue = document.getElementById("brightnessValue");
  const statusPill = document.getElementById("statusPill");
  const statusText = document.getElementById("statusText");
  const lampGlow = document.getElementById("lampGlow");
  const lampIcon = document.getElementById("lampIcon");
  const sliderHint = document.getElementById("sliderHint");
  const isManual = lightState.mode === "manual";

  // Slider is only usable in manual mode
  slider.disabled = !isManual;
  slider.value = lightState.brightness;
  sliderHint.textContent = isManual
    ? "Drag the slider to change brightness."
    : "Switch to Manual mode to use the slider.";
  brightnessValue.textContent = lightState.brightness + "%";

  // Enable or disable the ON/OFF buttons depending on the state
  document.getElementById("btnOn").disabled = lightState.power;
  document.getElementById("btnOff").disabled = !lightState.power;

  // Status pill and text
  if (lightState.power) {
    statusPill.textContent = "ON";
    statusPill.classList.remove("off");
    statusText.textContent = "Light is ON at " + lightState.brightness + "% brightness.";
  } else {
    statusPill.textContent = "OFF";
    statusPill.classList.add("off");
    statusText.textContent = "Light is OFF. No energy is being used.";
  }

  // Lamp preview glow matches the brightness
  const effectiveBrightness = lightState.power ? lightState.brightness : 0;
  lampGlow.style.opacity = effectiveBrightness / 100;
  lampIcon.style.filter = "brightness(" + (0.3 + effectiveBrightness / 100) + ")";

  // Sensor readings
  updateSensor("vehicleSensor", "🚗 Vehicle: ", lightState.vehicle);
  updateSensor("pedSensor", "🚶 Pedestrian: ", lightState.pedestrian);

  // Live energy load on the energy section
  updateLiveLoad();
}

// Show detected / not detected in a sensor box
function updateSensor(elementId, label, isDetected) {
  const element = document.getElementById(elementId);
  element.innerHTML = label + "<strong>" + (isDetected ? "Detected" : "Not detected") + "</strong>";
  element.classList.toggle("active", isDetected);
}

// Calculate the current power use: brightness x watts x number of lamps
function updateLiveLoad() {
  const effectiveBrightness = lightState.power ? lightState.brightness : 0;
  const kilowatts = (effectiveBrightness / 100) * LAMP_WATTS * LAMP_COUNT / 1000;
  document.getElementById("liveLoad").textContent = kilowatts.toFixed(2) + " kW";
}

/* ----------------------------------------------------------
   4. Energy chart (sample data)
   ---------------------------------------------------------- */
const weeklyData = [
  { day: "Mon", traditional: 38, smart: 26 },
  { day: "Tue", traditional: 40, smart: 27 },
  { day: "Wed", traditional: 39, smart: 25 },
  { day: "Thu", traditional: 41, smart: 28 },
  { day: "Fri", traditional: 42, smart: 27 },
  { day: "Sat", traditional: 45, smart: 31 },
  { day: "Sun", traditional: 44, smart: 30 }
];

function setupEnergyChart() {
  const chart = document.getElementById("chart");
  const maxValue = Math.max(...weeklyData.map(function (d) { return d.traditional; }));
  let totalOld = 0;
  let totalNew = 0;

  weeklyData.forEach(function (item) {
    totalOld += item.traditional;
    totalNew += item.smart;

    // Bar heights are percentages of the highest value
    const oldHeight = (item.traditional / maxValue) * 100;
    const newHeight = (item.smart / maxValue) * 100;

    const group = document.createElement("div");
    group.className = "bar-group";
    group.innerHTML =
      '<div class="bars">' +
        '<div class="bar bar-old" title="Traditional: ' + item.traditional + ' kWh" style="height:' + oldHeight + '%"></div>' +
        '<div class="bar bar-new" title="Smart: ' + item.smart + ' kWh" style="height:' + newHeight + '%"></div>' +
      '</div>' +
      '<span class="bar-label">' + item.day + '</span>';

    chart.appendChild(group);
  });

  // Show total savings for the week
  const saved = totalOld - totalNew;
  const percent = Math.round((saved / totalOld) * 100);
  document.getElementById("weekSaved").textContent = saved + " kWh (" + percent + "%)";
}

/* ----------------------------------------------------------
   5. Contact form validation (no backend, just checks inputs)
   ---------------------------------------------------------- */
function setupContactForm() {
  const form = document.getElementById("contactForm");
  const successMessage = document.getElementById("formSuccess");

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // stop the page from reloading

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // Clear old messages
    successMessage.textContent = "";
    clearErrors();

    let isValid = true;

    if (name === "") {
      showError("name", "Please enter your name.");
      isValid = false;
    }

    // Simple email pattern: something@something.something
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showError("email", "Please enter a valid email address.");
      isValid = false;
    }

    if (message.length < 10) {
      showError("message", "Message should be at least 10 characters.");
      isValid = false;
    }

    if (isValid) {
      successMessage.textContent = "Thank you, " + name + "! Your message has been sent.";
      form.reset();
    }
  });
}

// Show an error message under a field
function showError(fieldId, text) {
  const field = document.getElementById(fieldId);
  field.closest(".form-group").classList.add("invalid");
  document.getElementById(fieldId + "Error").textContent = text;
}

// Remove all error messages
function clearErrors() {
  document.querySelectorAll(".form-group").forEach(function (group) {
    group.classList.remove("invalid");
  });
  document.querySelectorAll(".error").forEach(function (error) {
    error.textContent = "";
  });
}
