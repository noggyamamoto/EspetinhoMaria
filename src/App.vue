<template>
  <div id="app">
    <h1>Calculadora</h1>
    <div class="android-calc">
      <div class="display">
        <input
          type="text"
          :value="displayValue"
          readonly
          class="display-input"
        />
      </div>
      <div class="keypad">
        <div class="row">
          <button @click="append('7')">7</button>
          <button @click="append('8')">8</button>
          <button @click="append('9')">9</button>
          <button class="op" @click="setOp('div')">÷</button>
        </div>
        <div class="row">
          <button @click="append('4')">4</button>
          <button @click="append('5')">5</button>
          <button @click="append('6')">6</button>
          <button class="op" @click="setOp('mul')">×</button>
        </div>
        <div class="row">
          <button @click="append('1')">1</button>
          <button @click="append('2')">2</button>
          <button @click="append('3')">3</button>
          <button class="op" @click="setOp('sub')">−</button>
        </div>
        <div class="row">
          <button @click="append('0')">0</button>
          <button @click="append('.')">.</button>
          <button @click="clear">C</button>
          <button class="op" @click="setOp('sum')">+</button>
        </div>
        <div class="row">
          <button class="equal" @click="calcular">=</button>
        </div>
      </div>
      <div v-if="mensagem && mensagem !== 'Sucesso'" class="erro">
        {{ mensagem }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      a: '',
      b: '',
      op: '',
      resultado: null,
      mensagem: '',
      aguardandoSegundo: false
    }
  },
  computed: {
    displayValue() {
      if (this.resultado !== null) return this.resultado;
      if (!this.op) return this.a || '0';
      if (this.aguardandoSegundo && !this.b) return this.a + ' ' + this.simboloOp(this.op) + ' ';
      return this.a + ' ' + this.simboloOp(this.op) + ' ' + (this.b || '');
    }
  },
  methods: {
    append(valor) {
      if (this.resultado !== null) {
        this.clear();
      }
      if (!this.op) {
        if (valor === '.' && this.a.includes('.')) return;
        this.a += valor;
      } else {
        if (!this.aguardandoSegundo) {
          this.aguardandoSegundo = true;
        }
        if (valor === '.' && this.b.includes('.')) return;
        this.b += valor;
      }
    },
    setOp(operacao) {
      if (!this.a) return;
      if (this.op && this.b) {
        this.calcular();
        this.op = operacao;
        this.a = String(this.resultado);
        this.b = '';
        this.resultado = null;
        this.aguardandoSegundo = true;
      } else {
        this.op = operacao;
        this.aguardandoSegundo = true;
      }
    },
    simboloOp(op) {
      return { sum: '+', sub: '−', mul: '×', div: '÷' }[op] || '';
    },
    clear() {
      this.a = '';
      this.b = '';
      this.op = '';
      this.resultado = null;
      this.mensagem = '';
      this.aguardandoSegundo = false;
    },
    async calcular() {
      this.mensagem = '';
      if (!this.a || !this.op || !this.b) {
        this.mensagem = 'Preencha a operação completa!';
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:8181/calc/${this.op}/${this.a}/${this.b}`
        );
        const data = await response.json();
        this.mensagem = data.mensagem;
        this.resultado = data.resultado;
        this.a = '';
        this.b = '';
        this.op = '';
        this.aguardandoSegundo = false;
      } catch (e) {
        this.mensagem = 'Erro ao conectar com o backend.';
      }
    }
  }
}
</script>

<style>
body {
  background: #ececec;
}
#app {
  font-family: 'Roboto', Arial, sans-serif;
  text-align: center;
  margin-top: 40px;
}
h1 {
  color: #222;
  font-weight: 400;
  margin-bottom: 24px;
  letter-spacing: 1px;
}
.android-calc {
  background: #222;
  border-radius: 18px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.13);
  width: 320px;
  margin: 0 auto;
  padding: 24px 18px 18px 18px;
}
.display {
  background: #111;
  border-radius: 10px;
  margin-bottom: 18px;
  padding: 10px 8px;
  min-height: 48px;
  text-align: right;
}
.display-input {
  width: 100%;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 2em;
  text-align: right;
  outline: none;
  font-family: 'Roboto Mono', monospace;
}
.keypad {
  width: 100%;
}
.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.keypad button {
  flex: 1 1 0;
  margin: 0 4px;
  height: 48px;
  font-size: 1.3em;
  border: none;
  border-radius: 8px;
  background: #333;
  color: #fff;
  transition: background 0.2s;
  cursor: pointer;
  font-family: 'Roboto', Arial, sans-serif;
}
.keypad button.op {
  background: #1976d2;
}
.keypad button.equal {
  background: #43a047;
  color: #fff;
  font-size: 1.4em;
  font-weight: bold;
  width: 100%;
  margin: 0;
  border-radius: 8px;
  height: 48px;
}
.keypad button:hover {
  background: #444;
}
.keypad button.op:hover {
  background: #1565c0;
}
.keypad button.equal:hover {
  background: #388e3c;
}
.erro {
  margin-top: 18px;
  background: #f2dede;
  color: #a94442;
  padding: 10px;
  border-radius: 6px;
  font-size: 1.1em; }
  </style>