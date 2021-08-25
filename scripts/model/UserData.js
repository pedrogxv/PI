class UserData {
    senha;
    email;
    nome;
    idade;
    links;
    cursos;
    experiencia;
    ensino;
    preferencias;
    acessKey;
    id;

    constructor(senha, email, nome, idade, experiencia, ensino) {
        this.senha = senha;
        this.email = email;
        this.nome = nome;
        this.idade = idade;
        this.experiencia = experiencia;
        this.ensino = ensino;
    }

    initAll(senha, email, nome, idade, links, cursos, experiencia, ensinio, preferencias, acessKey, id) {
        this.senha = senha;
        this.email = email;
        this.nome = nome;
        this.idade = idade;
        this.links = links;
        this.cursos = cursos;
        this.experiencia = experiencia;
        this.ensino = ensino;
        this.preferencias = preferencias;
        this.acessKey = acessKey;
        this.id = id;
    }

}

module.exports = UserData;