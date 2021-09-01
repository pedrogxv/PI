// script para fazer a alternância dos botões
// de 'Editar informções' e 'Cancelar'

const fieldToggles = document.querySelectorAll(".field-toggle")
const toggleHandler = document.querySelector('#toggle-handler')
const saveInfo = document.querySelector("#save-info")

let toggle = fieldToggles[0].disabled

toggleHandler.addEventListener('click', () => {
	toggle = !toggle
	fieldToggles.forEach((current) => {
		current.disabled = toggle
	})

	// toggle entre 'Cancelare' e 'Editar Info'
	toggleHandler.innerHTML = !toggle ? "Cancelar" : "Editar Informações"

	// toggle entre btn e link
	toggleHandler.className = !toggle ? "no-link btn btn-red" : "link"

	// exibindo botão de salvar
	saveInfo.style.display = toggle ? 'none !important' : 'flex'

	console.log("TESTES")
	console.log(saveInfo.style.display)

	// quando o usuário clicar em "Cancelar", 
	// a página ira dar refresh, 
	// para que as informações fiquem iguais ao servidor
	if (toggle) {
		setTimeout(() => {
			window.location.reload()
		}, 100)
	}

})
