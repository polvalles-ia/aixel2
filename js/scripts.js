// --- Partículas animadas ---
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return; 
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
    particlesContainer.appendChild(particle);
  }
}

// --- Animar estadísticas ---
function animateStats() {
  const stats = document.querySelectorAll('.stat-number');
  if (!stats.length) return; 

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const finalNumber = target.textContent;
        let currentNumber = 0;
        const increment = finalNumber.includes('%') ? 10 : 2;
        const duration = 2000;
        const stepTime = duration / (parseInt(finalNumber) / increment);

        const counter = setInterval(() => {
          currentNumber += increment;
          if (currentNumber >= parseInt(finalNumber)) {
            target.textContent = finalNumber;
            clearInterval(counter);
          } else {
            target.textContent = currentNumber + (finalNumber.includes('%') ? '%' : finalNumber.includes('+') ? '+' : '');
          }
        }, stepTime);
      }
    });
  });

  stats.forEach(stat => observer.observe(stat));
}

document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  animateStats();
});

// --- Chatbot ---
const chatWidget = document.getElementById('chat-widget');
if (chatWidget) {
  const chatHeader = document.getElementById('chat-header');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');

  chatHeader.addEventListener('click', () => {
    chatMessages.style.display = chatMessages.style.display === 'none' ? 'block' : 'none';
    document.getElementById('chat-input-area').style.display = chatInput.style.display === 'none' ? 'flex' : 'none';
  });

  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
  });

  // Función para añadir mensaje al chat
  function appendMessage(sender, text) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.innerHTML = marked.parse(text);
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Mensajes iniciales de bienvenida
  const initialMessages = [
    "Hola 👋, soy Autometa IA.",
    "Puedo ayudarte con automatización, IA y procesos de negocio.",
    "Prueba escribiendo: 'Muéstrame un ejemplo de flujo'."
  ];

  // Mostrar mensajes de bienvenida con pequeño retraso para efecto de 'typing'
  initialMessages.forEach((msg, index) => {
    setTimeout(() => appendMessage('bot', msg), 500 * (index + 1));
  });

  // Crear o recuperar ID de sesión
  let sessionId = localStorage.getItem('chatSessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('chatSessionId', sessionId);
  }

  // Función para enviar mensaje del usuario y recibir respuesta
  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    appendMessage('user', message);
    chatInput.value = '';

    fetch('https://vsjrr8.app.n8n.cloud/webhook/1bba5d39-cf4a-4a88-a5d4-bc402c46056b/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId })
    })
    .then(res => res.json())
    .then(data => appendMessage('bot', data.response || 'Error: sin respuesta'))
    .catch(err => {
      console.error(err);
      appendMessage('bot', 'Error en la conexión');
    });
  }
}


// --- Formulario de consulta ---
const consultationForm = document.getElementById('consultationForm');
if (consultationForm) {
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const submitBtn = document.getElementById('submitBtn');

  consultationForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    const formData = Object.fromEntries(new FormData(consultationForm));

    try {
      const res = await fetch('https://hook.eu2.make.com/ci4ioowkijs18xvhb1wg835xthv1l0eq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        successMessage.style.display = 'block';
        consultationForm.reset();
      } else {
        errorMessage.style.display = 'block';
      }
    } catch (err) {
      console.error(err);
      errorMessage.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Solicitar Consulta Gratuita";
    }
  });
}

