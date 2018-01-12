

var app = new Vue({
  el: '#app',
  data: {
    currentPizzeria: {link: 'stuff', name: 'stuff', id: 1},
    pizzerias: [],
    orders: [],
    newOrder: {},
    newPizzeria: {},
    selectedPizzeriaID: null
  },
  methods: {
    getOrders: function () {
      $.getJSON('/orders', {}, this.updateOrders);
    },
    getPizzerias: function () {
      $.getJSON('/pizzerias', {}, this.updatePizzerias);
    },
    updateOrders: function  (orders, textStatus, jqXHR) {
      this.orders = orders.map((order, i)  => {
        order["timestamp"] = moment(order["timestamp"]).format("DD.MM. HH:mm");
        return order;
      });
    },
    updatePizzerias: function  (pizzerias, textStatus, jqXHR) {
      this.pizzerias = pizzerias;
      this.currentPizzeria = pizzerias.filter((pizzeria, i) => {return pizzeria.active;})[0];
    },
    addNewOrder: function() {
      $.post('/orders', this.newOrder, (data) => {console.log(data)});
      this.newOrder = {};
    },
    addNewPizzeria: function() {
      $.post('/pizzerias', this.newPizzeria, (data) => {this.getPizzerias();});
      this.newPizzeria = {};
    },
    deleteOrders: function() {
      $.ajax({
        url: '/orders',
        type: 'DELETE',
        success: (data) => console.log(data)
      });
    },
    changePizzeria: function() {
      $.post('/pizzerias/' + this.selectedPizzeriaID, {}, (data) => {this.getPizzerias();});
    }
  }
})

app.getOrders()
app.getPizzerias()
