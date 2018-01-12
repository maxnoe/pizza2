
var orders = [
  {
    name: "Maximilian",
    description: "Pizza Funghi, groß",
    price: "5 €",
    date: moment().format('DD.MM. h:mm')
  },
  {
    name: "Kai",
    description: "Pizza Vegetaria, groß",
    price: "6 €",
    date: moment().format('DD.MM. h:mm')
  }
]

var app = new Vue({
  el: '#app',
  data: {
    pizzeria: {name: "La Scala", url: "https://www.pizzerialascaladortmund.de/"},
    orders: orders,
    delimiters: ["[[", "]]"]
  }
})
