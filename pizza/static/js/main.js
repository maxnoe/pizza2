var app = new Vue({
  el: '#app',
  data: {
    currentPizzeria: {link: 'stuff', name: 'stuff', id: 1},
    pizzerias: [],
    orders: [],
    newOrder: {},
    newPizzeria: {},
    selectedPizzeriaID: -1
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
      this.getOrders();
    },
    addNewPizzeria: function() {
      $.post('/pizzerias', this.newPizzeria, (data) => {console.log(data);});
      this.newPizzeria = {};
    },
    deleteOrders: function() {
      $.ajax({
        url: '/orders',
        type: 'DELETE',
        success: (data) => {console.log(data);}
      });
    },
    changePizzeria: function() {
      $.post('/pizzerias/' + this.selectedPizzeriaID, {}, (data) => {console.log(data);});
      this.selectedPizzeriaID = -1;
    },
    togglePaid: function(id) {
      $.post('/orders/' + id, {}, (data) => {console.log(data)});
    },
    deleteOrder: function(id) {
      $.ajax({
        url: '/orders/' + id,
        type: 'DELETE',
        success: (data) => {console.log(data)}
      });
    }
  }
})

var socket = io();

socket.on('orderUpdate', app.getOrders);
socket.on('pizzeriaUpdate', app.getPizzerias);

app.getOrders()
app.getPizzerias()
