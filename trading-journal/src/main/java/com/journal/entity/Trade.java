package com.journal.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "trades")
public class Trade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String instrument;
    private String strategy;
    private String rr;
    private String date; // Can be LocalDate, but using String based on user prompt 'date (String / LocalDate)'
    private String result;
    
    private Long userId;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInstrument() { return instrument; }
    public void setInstrument(String instrument) { this.instrument = instrument; }

    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }

    public String getRr() { return rr; }
    public void setRr(String rr) { this.rr = rr; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
