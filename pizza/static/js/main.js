

var app = new Vue({
  el: '#app',
  data: {
    pizzeria: {name: "La Scala", url: "https://www.pizzerialascaladortmund.de/"},
    orders: [],
    delimiters: ["[[", "]]"],
    newOrder: {},
  },
  methods: {
    getOrders: function () {
      $.getJSON('/orders', {}, this.updateOrders);
    },
    updateOrders: function  (orders, textStatus, jqXHR) {
      this.orders = orders.map((order, i)  => {
        order["timestamp"] = moment(order["timestamp"]).format("DD.MM. HH:mm");
        return order;
      });
    },
    addNewOrder: function() {
      $.post('/orders', this.newOrder, (data) => {console.log(data)});
      this.newOrder = {};
    }
  }
})

app.getOrders()
