const fieldToggles = document.querySelectorAll(".field-toggle")
const toggleHandler = document.querySelector('#toggle-handler')
const saveInfo = document.querySelector("#save-info")

let toggle = fieldToggles[0].disabled

toggleHandler.addEventListener('click', () => {
	toggle = !toggle
	fieldToggles.forEach((current) => {
		current.disabled = toggle
	})

	toggleHandler.innerHTML = !toggle ? "Cancelar" : "Editar Informações"
	toggleHandler.className = !toggle ? "no-link btn btn-red" : "link"

	// quando o usuário clicar em "Cancelar", 
	// a página ira dar refresh, 
	// para que as informações fiquem iguai ao servidor
	if (toggle) {
		saveInfo.style.display = "none !important"
		window.location.reload()
	}
	else
	// exibindo botão de salvar
		saveInfo.style.display = "flex"

})
