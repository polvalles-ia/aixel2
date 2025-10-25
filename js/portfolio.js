// Configuración del webhook - CAMBIA ESTA URL POR LA DE TU WEBHOOK DE N8N
const WEBHOOK_URL = 'https://n8n-n8n.hrzmi8.easypanel.host/webhook/portfolio';

// Función principal para manejar el envío del formulario
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('consultationForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    if (!form) {
        console.error('Formulario no encontrado');
        return;
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        // Ocultar mensajes anteriores
        hideMessages();

        // Validar campos requeridos antes de enviar
        if (!validateForm()) {
            showError('Por favor, completa todos los campos requeridos.');
            return;
        }

        // Preparar datos del formulario
        const formData = collectFormData();

        // Enviar al webhook
        await sendToWebhook(formData);
    });

    // Función para recopilar datos del formulario
    function collectFormData() {
        return {
            nombre: document.getElementById('nombre').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim() || null,
            empresa: document.getElementById('empresa').value.trim() || null,
            procesos: document.getElementById('procesos').value.trim(),
            timestamp: new Date().toISOString(),
            origen: 'Formulario Web Consulta',
            utm_source: getUrlParameter('utm_source') || null,
            utm_medium: getUrlParameter('utm_medium') || null,
            utm_campaign: getUrlParameter('utm_campaign') || null
        };
    }

    // Función para validar el formulario
    function validateForm() {
        const requiredFields = ['nombre', 'email', 'procesos'];
        
        for (const field of requiredFields) {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                element?.focus();
                return false;
            }
        }

        // Validar formato del email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const email = document.getElementById('email').value.trim();
        if (!emailRegex.test(email)) {
            document.getElementById('email').focus();
            showError('Por favor, introduce un email válido.');
            return false;
        }

        return true;
    }

    // Función principal para enviar al webhook
    async function sendToWebhook(data) {
        // Cambiar estado del botón
        setLoadingState(true);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            // Intentar parsear la respuesta JSON
            let result;
            try {
                result = await response.json();
            } catch (e) {
                // Si no es JSON válido, usar texto
                result = { message: await response.text() };
            }

            // Manejar respuesta exitosa
            handleSuccess(result);

        } catch (error) {
            console.error('Error al enviar formulario:', error);
            handleError(error);
        } finally {
            setLoadingState(false);
        }
    }

    // Función para manejar éxito
    function handleSuccess(result) {
        console.log('Formulario enviado exitosamente:', result);
        
        // Mostrar mensaje de éxito
        showSuccess();
        
        // Limpiar formulario
        form.reset();
        
        // Scroll al mensaje de éxito
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Opcional: Enviar evento a Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'engagement',
                event_label: 'consulta_gratuita'
            });
        }

        // Opcional: Redirigir después de 3 segundos
        // setTimeout(() => {
        //     window.location.href = '/gracias.html';
        // }, 3000);
    }

    // Función para manejar errores
    function handleError(error) {
        console.error('Error detallado:', error);
        
        let errorMsg = 'Hubo un error al enviar el formulario. ';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMsg += 'Verifica tu conexión a internet e inténtalo de nuevo.';
        } else if (error.message.includes('404')) {
            errorMsg += 'El servicio no está disponible temporalmente.';
        } else if (error.message.includes('500')) {
            errorMsg += 'Error interno del servidor. Inténtalo más tarde.';
        } else {
            errorMsg += 'Por favor, inténtalo de nuevo o contáctanos directamente.';
        }
        
        showError(errorMsg);
    }

    // Funciones de utilidad para la UI
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'not-allowed';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Solicitar Consulta Gratuita';
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
    }

    function showSuccess() {
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        
        // Auto-hide después de 10 segundos
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 10000);
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        
        // Auto-hide después de 8 segundos
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 8000);
    }

    function hideMessages() {
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
    }

    // Función para obtener parámetros de la URL (para tracking UTM)
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
});

// Función adicional para envío programático (opcional)
window.AutometaIA = {
    async sendConsultation(data) {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                timestamp: new Date().toISOString(),
                origen: 'API Programática'
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return response.json();
    }
};
