export default class User {

    id = 0;
    nome = "";
    idade = 0;
    apresentacao;
    curriculo;
    links = {};
    cursos = {};
    experiencia = {};
    ensino = {};

    constructor () {}

    constructor (id, nome, idade, apresentacao, curriculo, links, cursos, experiencia, ensino) {
        this.id = id;
        this.nome = nome;
        this.idade = idade;
        this.apresentacao = apresentacao;
        this.curriculo = curriculo;
        this.links = links;
        this.cursos = cursos;
        this.experiencia = experiencia;
        this.ensino = ensino;
    }

    initializeWithId (id) {

        // TODO: implementar conexão com o db para query getWhere(id)

    }

}