document.getElementById('scrapeButton').addEventListener('click', async () => {
    const feedback = document.getElementById('feedback');
    const output = document.getElementById('output');
    
    feedback.textContent = "Realizando scraping...";
    output.innerHTML = "";
  
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    // Ejecuta el script en la página activa con un delay
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeProducts
    }, (results) => {
      const data = results[0].result; // Recoge los resultados
      if (data.length === 0) {
        feedback.textContent = "No se encontraron productos.";
        document.getElementById('downloadButton').style.display = "none";
      } else {
        feedback.textContent = "Scraping completado.";
        output.innerHTML = data.map((product, i) => `<p>Producto ${i + 1}: ${product.name} - ${product.sellerName} - ${product.salePrice}</p>`).join('');
        document.getElementById('downloadButton').style.display = "inline";
        document.getElementById('downloadButton').onclick = () => downloadJSON(data);
      }
    });
  });
  
  // Función para realizar el scraping
  async function scrapeProducts() {
    function delay(time) {
      return new Promise(resolve => setTimeout(resolve, time));
    }
  
    await delay(200); // Espera 200 ms para asegurarse de que la página esté cargada
  
    let cards = document.querySelectorAll('div.showcase-grid>div> .Showcase__content'); // Selecciona todos los elementos con la clase 'card'
    cards = [...cards]; // Convierte NodeList a Array
  
    // Mapea los elementos de las tarjetas a un array de productos
    const products = cards.map(el => {
      const name = el.querySelector('.Showcase__name')?.textContent.trim() || "Nombre no encontrado";
      const sellerName = el.querySelector('.Showcase__SellerName')?.textContent.trim() || "Vendedor no encontrado";
      const salePrice = el.querySelector('.Showcase__salePrice')?.textContent.trim() || "Precio no encontrado";
      return { name, sellerName, salePrice }; // Retorna un objeto por cada producto
    });
  
    return products; // Devuelve todos los productos encontrados
  }
  
  // Función para descargar el JSON con el nombre ingresado por el usuario
  function downloadJSON(data) {
    const filenameInput = document.getElementById('filenameInput');
    const filename = filenameInput.value.trim() || "products"; // Nombre predeterminado si no se ingresa uno
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  