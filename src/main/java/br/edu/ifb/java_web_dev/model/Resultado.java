package br.edu.ifb.java_web_dev.model;

public class Resultado {
    private String mensagem;
    private Object resultado;

    public Resultado(String mensagem, Object resultado) {
        this.mensagem = mensagem;
        this.resultado = resultado;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public Object getResultado() {
        return resultado;
    }

    public void setResultado(Object resultado) {
        this.resultado = resultado;
    }
    
}
