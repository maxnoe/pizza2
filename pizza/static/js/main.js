

var app = new Vue({
  el: '#app',
  data: {
    pizzeria: {name: "La Scala", url: "https://www.pizzerialascaladortmund.de/"},
    orders: [],
    delimiters: ["[[", "]]"]
  },
  methods: {
    getOrders: function () {
      console.log("Getting orders");
      $.getJSON('/orders', {}, this.updateOrders);
    },
    updateOrders: function  (orders, textStatus, jqXHR) {
      this.orders = orders.map((order, i)  => {
        order["timestamp"] = moment(order["timestamp"]).format("DD.MM. hh:mm");
        return order;
      });
    }
  }
})

app.getOrders()
