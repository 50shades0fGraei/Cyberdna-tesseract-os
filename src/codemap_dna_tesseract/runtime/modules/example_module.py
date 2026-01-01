"""Example module exposing simple functions via EXPORTS mapping."""

def hello(name="world"):
    return f"hello {name}"


def add(a, b):
    return a + b


EXPORTS = {
    "hello_v1": "hello",
    "add_v1": "add",
}
