document.getElementById('miForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const valor = e.target.mensaje.value;

  fetch('https://polvallesia-n8n-docker.hf.space//webhook/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mensaje: valor })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById('respuesta').textContent = JSON.stringify(data, null, 2);
  })
  .catch(err => {
    document.getElementById('respuesta').textContent = 'Error: ' + err;
  });
});
