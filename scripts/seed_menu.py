#!/usr/bin/env python3
"""Generate SQL INSERT statements for menu items from the Sopris CSV."""

import csv

# Spanish translations for categories and common items
CATEGORY_ES = {
    "Breakfast": "Desayuno",
    "Appetizers": "Aperitivos",
    "Salads": "Ensaladas",
    "Sandwiches": "Sándwiches",
    "Wraps": "Wraps",
    "Burgers": "Hamburguesas",
    "Mex/Ami": "Cocina Mexicana",
    "Dinner": "Cena",
    "Kids Menu": "Menú para Niños",
    "Dessert": "Postres",
    "Beverages": "Bebidas",
    "A La Carte": "A La Carta",
}

NAME_ES = {
    "Breakfast Platter": "Plato de Desayuno",
    "Chicken Fried Steak (BRK)": "Bistec Empanizado (Desayuno)",
    "Chorizo Scramble": "Huevos con Chorizo",
    "Denver Omelette": "Omelette Denver",
    "Garbage Omelette": "Omelette Surtido",
    "Ham and Cheese Omelette": "Omelette de Jamón y Queso",
    "Ham Scramble": "Huevos Revueltos con Jamón",
    "Huevos Rancheros": "Huevos Rancheros",
    "Meat Lovers Omelette": "Omelette para Carnívoros",
    "Senior Special": "Especial para Mayores",
    "Steak and Eggs": "Bistec con Huevos",
    "Ultimate Skillet": "Sartén Supremo",
    "Carne Asada Fries": "Papas con Carne Asada",
    "Chicken Nuggets (12pc)": "Nuggets de Pollo (12 pzas)",
    "Chicken Nuggets (16pc)": "Nuggets de Pollo (16 pzas)",
    "Hand-Breaded Tenders": "Tiras de Pollo Artesanales",
    "House Nachos": "Nachos de la Casa",
    "Onion Rings": "Aros de Cebolla",
    "Sample Platter": "Plato Surtido",
    "Chef Salad": "Ensalada del Chef",
    "Crispy Buffalo Salad": "Ensalada Buffalo Crujiente",
    "Grilled Chicken Salad": "Ensalada de Pollo a la Parrilla",
    "Honey Mustard Chicken": "Pollo con Mostaza y Miel",
    "Buffalo Chicken Sand.": "Sándwich de Pollo Buffalo",
    "Chipotle Chicken Melt": "Sándwich de Pollo Chipotle",
    "Club Sandwich": "Club Sándwich",
    "Cubano Sandwich": "Sándwich Cubano",
    "Fish Sandwich": "Sándwich de Pescado",
    "Gyro": "Gyro",
    "Monte Cristo": "Monte Cristo",
    "Navajo Taco": "Taco Navajo",
    "Patty Melt": "Patty Melt",
    "Buffalo Chicken Wrap": "Wrap de Pollo Buffalo",
    "Chicken Bacon Ranch": "Wrap de Pollo con Tocino y Ranch",
    "Bacon Cheese Burger": "Hamburguesa con Tocino y Queso",
    "Barbecue Bacon Burger": "Hamburguesa BBQ con Tocino",
    "Chipotle Avocado Burger": "Hamburguesa Chipotle con Aguacate",
    "Double Bacon Cheddar": "Doble Tocino con Cheddar",
    "Jalapeño Bacon Burger": "Hamburguesa con Jalapeño y Tocino",
    "Mushroom Bacon Swiss": "Hamburguesa con Champiñones y Tocino",
    "Straight Up Burger": "Hamburguesa Clásica",
    "Carne Asada Platter": "Plato de Carne Asada",
    "Chimichanga Platter": "Plato de Chimichanga",
    "Enchilada Platter": "Plato de Enchiladas",
    "Fajita Trio (3)": "Trío de Fajitas",
    "Fajitas (Single)": "Fajitas (Individual)",
    "Fajitas Combo (2)": "Combo de Fajitas (2)",
    "Puffy Tacos": "Tacos Inflados",
    "Quesabirria": "Quesabirria",
    "Quesadillas": "Quesadillas",
    "Street Tacos (Single)": "Tacos Callejeros (Individual)",
    "Taco Platter (3)": "Plato de Tacos (3)",
    "Taco Salad": "Ensalada de Taco",
    "Alfredo Pasta": "Pasta Alfredo",
    "Barbecue Pork Ribs": "Costillas de Cerdo BBQ",
    "Chicken Fried Steak": "Bistec Empanizado",
    "Fish and Chips": "Pescado con Papas",
    "Hamburger Steak": "Bistec de Hamburguesa",
    "Healthy Grilled Chicken": "Pollo a la Parrilla Saludable",
    "New York Steak (12oz)": "Bistec New York (12oz)",
    "Rib Eye Steak (12oz)": "Rib Eye (12oz)",
    "Shrimp Dinner": "Cena de Camarones",
    "Surf and Turf": "Mar y Tierra",
    "T-Bone Steak (16oz)": "T-Bone (16oz)",
    "Kids Cheeseburger": "Hamburguesa con Queso para Niños",
    "Kids Chicken Breast": "Pechuga de Pollo para Niños",
    "Kids Chicken Nuggets": "Nuggets para Niños",
    "Kids Grilled Cheese": "Sándwich de Queso para Niños",
    "Apple Pie a La Mode": "Pay de Manzana con Helado",
    "Banana Cream Pie": "Pay de Crema de Plátano",
    "Banana Split": "Banana Split",
    "Chocolate Cream Pie": "Pay de Crema de Chocolate",
    "Coconut Cream Pie": "Pay de Crema de Coco",
    "Shake (Chocolate)": "Malteada de Chocolate",
    "Shake (Oreo)": "Malteada de Oreo",
    "Shake (Strawberry)": "Malteada de Fresa",
    "Shake (Vanilla)": "Malteada de Vainilla",
    "Specialty Popsicle": "Paleta Especial",
    "Bottled Soda": "Refresco en Botella",
    "Coffee": "Café",
    "Fountain Soda": "Refresco de Fuente",
    "Hot Tea": "Té Caliente",
    "Iced Tea": "Té Helado",
    "Large Bottle soda": "Refresco en Botella Grande",
    "Bacon": "Tocino",
    "Fries/Tots": "Papas Fritas/Tater Tots",
}

DESCRIPTIONS = {
    "Breakfast Platter": "Three eggs any style, hash browns, and your choice of bacon, links, or sausage patty.",
    "Chicken Fried Steak (BRK)": "Hand-breaded chicken fried steak smothered in country gravy, served with eggs and toast.",
    "Chorizo Scramble": "Three egg scramble with chorizo, served with home fried potatoes and refried beans.",
    "Denver Omelette": "Ham, peppers, and onions folded into a fluffy three-egg omelette.",
    "Garbage Omelette": "Bacon, ham, sausage, peppers, onions, tomatoes, and jalapeños topped with melted cheese.",
    "Ham and Cheese Omelette": "Diced ham and melted cheese in a three-egg omelette.",
    "Ham Scramble": "Three egg scramble with diced ham.",
    "Huevos Rancheros": "Two eggs over easy on corn tortillas smothered in ranchero sauce.",
    "Meat Lovers Omelette": "Bacon, ham, and sausage packed into a hearty three-egg omelette.",
    "Steak and Eggs": "12oz New York steak served with hash browns and three eggs any style.",
    "Ultimate Skillet": "Home fried potatoes, bacon, green onion, tomatoes, green chilies, and cheese with three eggs any style.",
    "Carne Asada Fries": "French fries topped with cheese sauce, pico de gallo, jalapeños, guacamole, and sour cream. Choice of protein.",
    "House Nachos": "Crispy tortilla chips covered with cheese sauce, taco meat, pico de gallo, guacamole, and sour cream.",
    "Sample Platter": "Chicken strips, finger steaks, onion rings, tater tots, and boneless wings.",
    "Quesabirria": "Three crispy beef tacos with melted cheese topped with cilantro and onions, served with a side of consomé.",
    "Street Tacos (Single)": "Corn tortilla topped with cilantro and onion. Choice of: Carne Asada, Adobada, Al Pastor, Pollo, Alambre, Carnitas, or Lengua.",
    "Taco Platter (3)": "Three tacos on corn tortillas topped with cilantro and onion, served with rice and beans.",
    "Carne Asada Platter": "Grilled marinated steak served with rice and beans, garnished with guacamole and sour cream.",
    "Enchilada Platter": "Chicken or beef smothered with homemade red or green enchilada sauce, topped with guacamole and sour cream.",
    "Wet Burritos": "Smothered with red and green sauce. Choice of: Carne Asada, Adobada, Al Pastor, Pollo, or Green Chili Pork.",
    "Rib Eye Steak (12oz)": "Our most popular cut — a well-marbled 12oz Rib Eye, juicy and flavorful.",
    "T-Bone Steak (16oz)": "Fire-grilled 16oz choice T-Bone steak, a crowd pleaser.",
    "Surf and Turf": "12oz top sirloin with sautéed shrimp — the best of land and sea.",
    "Barbecue Pork Ribs": "Fire-grilled fall-off-the-bone ribs brushed with barbecue sauce, served with coleslaw and fries.",
    "Specialty Popsicle": "Authentic Mexican popsicles in rotating flavors including mango, tamarind, horchata, and more.",
}

rows = []
with open("/home/ubuntu/upload/menusopris.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row["Item Name"].strip()
        category = row["Category"].strip()
        price = row["Credit Price"].strip()
        modifiers = row["Modifier Groups"].strip()

        name_es = NAME_ES.get(name, "")
        desc = DESCRIPTIONS.get(name, "")

        price_val = f"{float(price):.2f}" if price else "NULL"
        
        def esc(s):
            return s.replace("'", "''") if s else ""

        rows.append(
            f"('{esc(category)}', '{esc(name)}', "
            f"{'NULL' if not name_es else repr(name_es)}, "
            f"{price_val}, "
            f"{'NULL' if not desc else repr(desc)}, "
            f"{'NULL' if not modifiers else repr(modifiers)})"
        )

sql = "INSERT INTO menu_items (category, name, name_es, price, description, modifier_groups) VALUES\n"
sql += ",\n".join(rows) + ";"

print(sql)
