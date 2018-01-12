from peewee import (
    SqliteDatabase,
    IntegerField,
    TextField,
    BooleanField,
    Model,
    DateTimeField,
)


database = SqliteDatabase(None)


class Order(Model):
    description = TextField()
    name = TextField()
    price = IntegerField()
    paid = BooleanField()
    timestamp = DateTimeField()

    class Meta:
        database = database


class Pizzeria(Model):
    name = TextField()
    link = TextField()
    active = BooleanField(default=False)

    class Meta:
        database = database


def create_tables(drop=False):
    database.connect()

    if drop:
        database.drop_tables([Order, Pizzeria], safe=True)

    database.create_tables([Order, Pizzeria], safe=True)
    Pizzeria.get_or_create(
        name='Pizzeria La Scala',
        link='http://www.pizzerialascaladortmund.de',
        defaults=dict(active=True),
    )
