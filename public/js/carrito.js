const lista = document.querySelector('#carrito-detalle tbody');
const vaciarBtn = document.getElementById('vaciar-carrito');
const pagarBtn = document.getElementById('pagar');

//Al cargar la página, mostrar el carrito guardado en localStorage
document.addEventListener('DOMContentLoaded',mostrarCarrito);

vaciarBtn.addEventListener('click',vaciarCarrito);

pagarBtn.addEventListener('click',pagar);

//Muestra el carrito en la tabla
function mostrarCarrito(){
    //Obtenemos el carrito guardado en localStorage o un arreglo vacío si no hay nada
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Limpiamos la tabla antes de mostrar los productos (para no duplicar)
    lista.innerHTML='';

    // Recorremos el carrito y creamos filas <tr> para cada producto
    carrito.forEach(elemento => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td><img src="${elemento.imagen}" width="100"></td>
        <td>${elemento.titulo}</td>
        <td>${elemento.precio}</td>
        <td>
            <a href="#" class="borrar" data-id="${elemento.id}">X </a>
        </td>
        `;
        lista.appendChild(row);
    });

    // Activamos la opción de borrar un solo producto
    lista.querySelectorAll('.borrar').forEach(btn => {
        btn.addEventListener('click', (e) =>{
            e.preventDefault();
            eliminarElemento(e.target.getAttribute('data-id'));
        });
    });
}

//Elimina un solo producto del carrito (por id)
function eliminarElemento(id){
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Filtramos para quitar el producto con ese id
    carrito = carrito.filter(item => item.id !== id);

    // Guardamos el carrito actualizado
    localStorage.setItem('carrito',JSON.stringify(carrito));

    // Volvemos a mostrar el carrito actualizado en la tabla
    mostrarCarrito();
}


//Vacía todo el carrito
function vaciarCarrito(){
    localStorage.removeItem('carrito');
    mostrarCarrito();
}

//Simulación el pago
function pagar(){
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0){
        alert("Tu carrito está vacío 🛒");
        return;
    }

    alert("¡Gracias por tu compra! 🎉");

    // Después del pago vaciamos el carrito
    localStorage.removeItem('carrito');
    mostrarCarrito();
}