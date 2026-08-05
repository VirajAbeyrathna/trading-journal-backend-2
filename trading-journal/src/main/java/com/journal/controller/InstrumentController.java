package com.journal.controller;

import com.journal.entity.Instrument;
import com.journal.repository.InstrumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/instruments")
@CrossOrigin
public class InstrumentController {

    @Autowired
    private InstrumentRepository instrumentRepository;

    @GetMapping
    public ResponseEntity<List<Instrument>> getAllInstruments() {
        List<Instrument> instruments = instrumentRepository.findAll();
        return ResponseEntity.ok(instruments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Instrument> getInstrumentById(@PathVariable Long id) {
        Optional<Instrument> instrument = instrumentRepository.findById(id);
        return instrument.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Instrument> createInstrument(@RequestBody Instrument instrument) {
        Instrument savedInstrument = instrumentRepository.save(instrument);
        return ResponseEntity.ok(savedInstrument);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Instrument> updateInstrument(@PathVariable Long id, @RequestBody Instrument instrumentDetails) {
        Optional<Instrument> optionalInstrument = instrumentRepository.findById(id);
        if (optionalInstrument.isPresent()) {
            Instrument existingInstrument = optionalInstrument.get();
            existingInstrument.setSymbol(instrumentDetails.getSymbol());
            existingInstrument.setName(instrumentDetails.getName());
            existingInstrument.setType(instrumentDetails.getType());
            Instrument updatedInstrument = instrumentRepository.save(existingInstrument);
            return ResponseEntity.ok(updatedInstrument);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstrument(@PathVariable Long id) {
        if (instrumentRepository.existsById(id)) {
            instrumentRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
