package com.nexstay.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "properties")
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String location;
    private String city;
    private Integer price;
    private String type;
    private String image;
    private Integer vacancies;

    @Column(name = "sharing_type")
    private String sharingType;

    @Column(name = "bathroom_type")
    private String bathroomType;

    @Column(name = "has_ac")
    private Boolean hasAc;

    @Column(name = "has_wifi")
    private Boolean hasWifi;

    @Column(name = "has_hot_water")
    private Boolean hasHotWater;

    @Column(length = 2000)
    private String description;

    @Column(length = 4000)
    private String gallery;

    private Boolean featured;
    private String status;

    public Property() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public Integer getVacancies() { return vacancies; }
    public void setVacancies(Integer vacancies) { this.vacancies = vacancies; }
    public String getSharingType() { return sharingType; }
    public void setSharingType(String sharingType) { this.sharingType = sharingType; }
    public String getBathroomType() { return bathroomType; }
    public void setBathroomType(String bathroomType) { this.bathroomType = bathroomType; }
    public Boolean getHasAc() { return hasAc; }
    public void setHasAc(Boolean hasAc) { this.hasAc = hasAc; }
    public Boolean getHasWifi() { return hasWifi; }
    public void setHasWifi(Boolean hasWifi) { this.hasWifi = hasWifi; }
    public Boolean getHasHotWater() { return hasHotWater; }
    public void setHasHotWater(Boolean hasHotWater) { this.hasHotWater = hasHotWater; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getGallery() { return gallery; }
    public void setGallery(String gallery) { this.gallery = gallery; }
    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
