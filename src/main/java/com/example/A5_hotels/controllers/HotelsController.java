/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.example.A5_hotels.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Los_e
 */
@RestController
@RequestMapping("hotels")
public class HotelsController {

    @Autowired
    ResourceLoader resourceLoader;

    @GetMapping(value = "all", produces = "application/json")
    public Object getAllHotels() {

        Resource resource = resourceLoader.getResource("classpath:static/json/data.json");
        ObjectMapper mapper = new ObjectMapper();

        try {
            return mapper.readValue(resource.getInputStream(), Object.class);
        } catch (IOException ex) {
            Logger.getLogger(HotelsController.class.getName()).log(Level.SEVERE, null, ex);
        }
        
        return null;
    }
}
