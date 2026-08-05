package com.journal.controller;

import com.journal.entity.Trade;
import com.journal.repository.TradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trades")
@CrossOrigin
public class TradeController {

    @Autowired
    private TradeRepository tradeRepository;

    @GetMapping("/all")
    public ResponseEntity<List<Trade>> getAllTrades() {
        List<Trade> trades = tradeRepository.findAll();
        return ResponseEntity.ok(trades);
    }

    @GetMapping
    public ResponseEntity<List<Trade>> getTrades(@RequestParam Long userId) {
        List<Trade> trades = tradeRepository.findByUserId(userId);
        return ResponseEntity.ok(trades);
    }

    @PostMapping
    public ResponseEntity<Trade> createTrade(@RequestBody Trade trade) {
        Trade savedTrade = tradeRepository.save(trade);
        return ResponseEntity.ok(savedTrade);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trade> updateTrade(@PathVariable Long id, @RequestBody Trade tradeDetails) {
        Trade trade = tradeRepository.findById(id).orElseThrow(() -> new RuntimeException("Trade not found"));
        trade.setInstrument(tradeDetails.getInstrument());
        trade.setStrategy(tradeDetails.getStrategy());
        trade.setRr(tradeDetails.getRr());
        trade.setDate(tradeDetails.getDate());
        trade.setResult(tradeDetails.getResult());
        Trade updatedTrade = tradeRepository.save(trade);
        return ResponseEntity.ok(updatedTrade);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrade(@PathVariable Long id) {
        tradeRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
