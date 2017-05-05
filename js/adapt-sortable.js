define(function(require) {

	var Adapt           = require('coreJS/adapt');
	var QuestionView    = require('coreViews/questionView');
	var JQueryUI        =  require('./jquery-ui.min');
	var TouchPunch      = require('./jquery.ui.touch-punch');

	var Sortable = QuestionView.extend({

		events: {
			"sortstop .sortable-items": "onSortStop"
		},

		/************************************** SETUP METHODS **************************************/

		setupQuestion: function() {
			var items = this.model.get("_items");
			this.model.set("_correctAnswer", _.pluck(items, "text"));
			this.setupItemsOrder();
		},

		onQuestionRendered: function() {
			this.setupSortable();
			this.restoreUserAnswer();
			this.setReadyStatus();
		},

		setupItemsOrder: function() {
			var items = this.model.get("_items");
			_.each(items, function(item, i) {
				item._correctPosition = i;
			});
			var itemsReordered = this.model.get("_isRandom") ? _.shuffle(items) : _.sortBy(items, "_startPosition");
			this.model.set("_itemsReordered", itemsReordered);
		},

		setupSortable : function () {
			if (!this.model.get("_isEnabled")) return;

			this.$(".sortable-items").sortable({
				containment: "parent",
				axis: "y",
				tolerance: "pointer"
			});
		},

		/************************************** HELPER METHODS **************************************/

		fixContainerHeight: function(force) {
			if (!this._isHeightFixed || force) {
				var $items = this.$(".sortable-items");
				$items.height($items.height());
				this._isHeightFixed = true;
			}
		},

		getSortableItemByIndex: function(itemIndex) {
			var $items = this.$(".sortable-item");
			var items = this.model.get("_items");
			for (var i = 0; i < $items.length; i++) {
				var text = $items.eq(i).children(".sortable-item-text").html();
				if (items[itemIndex].text === text) return $items.eq(i);
			}
		},

		getSortableItemByText: function(text) {
			var $items = this.$(".sortable-item");
			for (var i = 0; i < $items.length; i++) {
				var sortableText = $items.eq(i).children(".sortable-item-text").html();
				if (sortableText === text) return $items.eq(i);
			}
		},

		moveSortable: function($el, top) {

		},

		/************************************** SORTABLE METHODS **************************************/

		onSortStop: function() {
			this._isChanged = true;
		},

		/************************************** QUESTION METHODS **************************************/

		canSubmit: function() {
			return this._isChanged;
		},

		markAnswers: function() {
			var userAnswer = this.model.get("_userAnswer");
			_.each(this.model.get("_items"), function(item, i) {
				item._isCorrect = userAnswer[i] === i;
			});
		},

		showMarking: function() {
			if (!this.model.get("_canShowMarking")) return;

			_.each(this.model.get("_items"), function(item, i) {
				var $item = this.getSortableItemByIndex(i);
				$item.removeClass("correct incorrect").addClass(item._isCorrect ? "correct" : "incorrect");
			}, this);
		},

		isCorrect: function() {
			this.markAnswers();

			// do we have any _isCorrect == false?
			return !_.contains(_.pluck(this.model.get("_items"),"_isCorrect"), false);
		},

		resetQuestion: function() {
			var answer = _.map(this.model.get("_itemsReordered"), function(item) {
				return item._correctPosition;
			});
			this.showAnswer(answer, true);
			this._isReset = true;
		},

		restoreUserAnswer: function() {

			if (!this.model.get("_isSubmitted")) return;

			var userAnswer = this.model.get("_userAnswer");

			_.each(this.model.get("_items"), function(item, i) {
				item.userAnswer = userAnswer[i];
			});

			this.setQuestionAsSubmitted();
			this.markQuestion();
			this.setScore();
			this.showMarking();
			this.setupFeedback();
		},

		onHideCorrectAnswerClicked: function() {
			if (this._isAnimating) return;

			this.setQuestionAsHideCorrect();
			this._runModelCompatibleFunction("updateButtons");
			this.showAnswer(this.model.get("_userAnswer"), true);
		},

		onShowCorrectAnswerClicked: function() {
			if (this._isAnimating) return;

			var answer = _.map(this.model.get("_items"), function(item, i) {
				return i;
			});

			this.setQuestionAsShowCorrect();
			this._runModelCompatibleFunction("updateButtons");
			this.showAnswer(answer, true);
		},

		showAnswer: function(answer, animate) {
			if (this._isAnimating || (this.model.get("_isEnabled") && !this._isReset)) return;
			this.fixContainerHeight();

			var $container = this.$(".sortable-items");
			var $items = this.$(".sortable-item");
			var w = $items.width();
			var sortableTop = 0;
			var animationTime = animate ? 400 : 0;
			var timeout = 10;
			var zIndex = 100;
			var offsets = _.map($items, function(el, i) {
				return $items.eq(i).offset();
			});

			this._isAnimating = true;

			_.each($items, function(el, i) {
				var $el = $(el);
				var offset = offsets[i];
				var $item = this.getSortableItemByIndex(answer[i]);
				el.style.position = "absolute";
				el.style.width = w + "px";
				$el.offset(offset);
				$container.append($item);
				zIndex --;
				$item.css({zIndex: zIndex});
				setTimeout(function() {
					$item.animate({top: sortableTop}, animationTime);
					sortableTop += $item.outerHeight(true);

					if (i === $items.length - 1) {

					}
				}, timeout);
			}, this);

			setTimeout(function() {
				$items.attr("style", null);
				this._isAnimating = false;
			}.bind(this), 450);
		},

		storeUserAnswer: function() {
			var correctAnswer = this.model.get("_correctAnswer");
			var userAnswer = _.map(this.$(".sortable-item"), function(item) {
				return correctAnswer.indexOf($(item).children(".sortable-item-text").html());
			});

			_.each(this.model.get("_items"), function(item, i) {
				item.userAnswer = userAnswer[i];
			});

			this.model.set("_userAnswer", userAnswer);
		},

		setScore: function() {
			var userAnswer = this.model.get("_userAnswer");
			var numItems = this.model.get("_items").length;
			var maxScore = numItems * numItems - numItems;
			var userScore = maxScore;

			_.each(userAnswer, function(userIndex, i) {
				var penalty = userIndex - i;
				if (penalty < 0) penalty *= -1;
				userScore -= penalty;
			}, this);

			var totalScore = (userScore / maxScore) * this.model.get("_questionWeight");
			this.model.set('_score', totalScore);
		},

		disableQuestion: function() {
			this.$(".sortable-items").sortable("disable");
		},

		enableQuestion: function() {
			this.$(".sortable-items").sortable("enable");
		}
	});

	Adapt.register("sortable", Sortable);

});