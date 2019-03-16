# adapt-sortable

**Sortable** is a *question component* for the Adapt Framework created by Dan storey.

A learner must drag listed items into the correct order.

[**Click here for an interactive demo**](https://danielstorey.github.io/adapt-demo-course/#/id/co-main)

## Installation



## Settings Overview

The attributes listed below are used in *components.json* to configure **Sortable**, and are properly formatted as JSON in [*example.json*](https://github.com/danielstorey/adapt-sortable/example.json).

### Attributes

[**core model attributes**](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes): These are inherited by every Adapt component. [Read more](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes).

**_component** (string): This value must be: `sortable`.

**_classes** (string): CSS class name to be applied to **Sortable** containing `div`. The class must be predefined in one of the Less files. Separate multiple classes with a space.

**_layout** (string): This defines the horizontal position of the component in the block. Acceptable values are `full`, `left` or `right`.

**instruction** (string): This optional text appears above the component. It is frequently used to
guide the learner’s interaction with the component.

**title** (string): This is the title text for the **Sortable** component.

**body** (string): This is the main text for the **Sortable** component.

**_isRandom** (boolean): Whether the items should start in a random order. This will override the items' `_startPostion` values

**_items** (string): Each item represents an item in the list and contains values for **text** and **_startPosition**.

>**text** (string): The text to be displayed.

>**_startPosition** (number): The position in the list this item should start in. This value will be ignored if `_isRandom` is set to `true` 

### Accessibility

### Limitations

No known limitations

----------------------------
**Framework versions:**  >=2.0.0
**Author / maintainer:** Dan Storey
