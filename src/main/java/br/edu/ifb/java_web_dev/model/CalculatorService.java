package br.edu.ifb.java_web_dev.model;

public class CalculatorService {
    public int sum(int a, int b) {
        return a + b;
    }

    public int sub(int a, int b) {
        return a - b;
    }

    public int mul(int a, int b) {
        return a * b;
    }

    public double div(int a, int b) {
        if (b == 0) {
            throw new IllegalArgumentException("O valor de b não pode ser zero.");
        }
        return (double) a / b;
    }
}
