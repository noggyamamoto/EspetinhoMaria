package br.edu.ifb.java_web_dev.controller;

import br.edu.ifb.java_web_dev.model.CalculatorService;
import br.edu.ifb.java_web_dev.model.Resultado;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/calc")
@CrossOrigin
public class CalculatorRestController {

    private final CalculatorService calculatorService = new CalculatorService();

    @GetMapping(value = "/sum/{a}/{b}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Resultado sum(@PathVariable int a, @PathVariable int b) {
        int result = calculatorService.sum(a, b);
        return new Resultado("Sucesso", result);
    }

    @GetMapping(value = "/sub/{a}/{b}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Resultado sub(@PathVariable int a, @PathVariable int b) {
        int result = calculatorService.sub(a, b);
        return new Resultado("Sucesso", result);
    }

    @GetMapping(value = "/mul/{a}/{b}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Resultado mul(@PathVariable int a, @PathVariable int b) {
        int result = calculatorService.mul(a, b);
        return new Resultado("Sucesso", result);
    }

    @GetMapping(value = "/div/{a}/{b}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Resultado div(@PathVariable int a, @PathVariable int b) {
        try {
            double result = calculatorService.div(a, b);
            return new Resultado("Sucesso", result);
        } catch (IllegalArgumentException e) {
            return new Resultado(e.getMessage(), 0);
        }
    }
}