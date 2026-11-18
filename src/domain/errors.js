export class ValidacaoError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidacaoError';
    this.codigo = 'DADOS_INVALIDOS';
  }
}

export class NaoEncontradoError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NaoEncontradoError';
    this.codigo = 'NAO_ENCONTRADO';
  }
}

export class RegraDeNegocioError extends Error {
  constructor(codigo, message) {
    super(message);
    this.name = 'RegraDeNegocioError';
    this.codigo = codigo;
  }
}
