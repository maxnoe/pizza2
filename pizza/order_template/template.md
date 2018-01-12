# Pizzabestellung

Bestellung abgerufen am {{ timestamp }}.   
Lieferung bitte erst ab 18:00 Uhr.  

| Bestellung | Name | Preis |
|---|---|---:|
{% for order in orders %}|{{ order['description'] }}|{{ order['name'] }}|{{ order['price'] | cents2euros }}|
{% endfor %}

Summe: {{ total | cents2euros }}

### Lieferadresse: 

{{ name }}  
Fa. TU Dortmund - Abt. Physik   
Otto-Hahn-Str. 4a   
44227 Dortmund

Raum: CP-03-123
Vom Haupteingang nach rechts,
den Aufzug in den 3. Stock nehmen. 
Durch die Glastür und den rechten Flur nehmen.
Dann ist es die erste Tür hinter der Glastür.
