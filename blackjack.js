const VALUE_IDX = 0;
const SUIT_IDX = 1;
const SUIT_NAMES = ["hearts", "clubs", "diamonds", "spades"];
const PLAY_HISTORY_LENGTH = 24;

// Random functionality needed
function get_rand_int(min, max){
    return Math.floor((Math.random() * (max-min))+min);
}

function shuffle(lst){
    for(let i = 0;i < lst.length;i++){
        let swap = get_rand_int(i, lst.length);
        let temp = lst[i];
        lst[i] = lst[swap];
        lst[swap] = temp;
    }
}

//  Handling and creating the deck

function create_deck(){
    var suits = ["H", "C", "D", "S"];
    var result = [];
    for(let value = 1; value <= 13;value++){
        for(let suit = 0; suit < 4;suit++){
            result.push([value, suit]);
        }
    }
    return result;
}

function get_card_value(card){
    if(card[VALUE_IDX] < 11)
        return card[VALUE_IDX];
    return 10;
}

function get_hand_value(hand){
    var ace_less_value = 0;
    for(let i = 0;i < hand.length;i++){
        ace_less_value += get_card_value(hand[i]);
    }
    var aces_value = ace_less_value;
    for(let i = 0;i < hand.length;i++){
        if(hand[i][VALUE_IDX] == 1 && (aces_value + 10) <= 21){
            aces_value += 10;
        }
    }
    return aces_value;
}

// DOM methods

function value_str(card){
    if(card[VALUE_IDX] == 1){
        return "ace";
    }
    if(card[VALUE_IDX] < 11){
        return card[VALUE_IDX].toString();
    }
    if(card[VALUE_IDX] == 11){
        return "jack";
    }
    if(card[VALUE_IDX] == 12){
        return "queen";
    }
    if(card[VALUE_IDX] == 13){
        return "king";
    }
}

function card_file(card){
    return "images/" + value_str(card) + "_of_" + SUIT_NAMES[card[SUIT_IDX]] + ".png";
}

function card_alt_text(card){
    return value_str(card) + " of " + SUIT_NAMES[card[SUIT_IDX]];
}

function update_hand(hand, id, limit=-1){
    if(limit < 0){
        limit = hand.length;
    }
    var hand_str = "";
    var image_begin = "<image src=\"";
    for(let i = 0;i < limit;i++){
        var image_end = "\" alt=\"" + card_alt_text(hand[i]) + "\">\n";
        hand_str += image_begin + card_file(hand[i]) + image_end;
    }
    for(let i = limit;i < hand.length;i++){
        hand_str += "<image src=\"images/red_back.png\" alt=\"Back of a playing card\">\n";
    }
    document.getElementById(id).innerHTML = hand_str;
}

function update_hand_value(hand, id){
    let value = get_hand_value(hand);
    if(value > 21)
        value = "BUST";
    document.getElementById(id).innerHTML = "<p> <strong>Hand Value: </strong>" + value + "\n"; 
}

// Variables needed to function
var play_history = [];
var card_deck = create_deck();
shuffle(card_deck);
var player_hand = [card_deck.pop(), card_deck.pop()];
var dealer_hand = [card_deck.pop(), card_deck.pop()];
var hand_resolved = false;

//Methods for running Blackjack

// Display update methods
function update_dealer(reveal = false){
    if(reveal){
        update_hand(dealer_hand, "dealer-hand");
        update_hand_value(dealer_hand, "dealer-value");
    }
    else{
        update_hand(dealer_hand, "dealer-hand", 1);
        document.getElementById("dealer-value").innerHTML = "<p> <strong>Hand Value: </strong> ???";
    }
}

function update_player(){
    update_hand(player_hand, "player-hand");
    update_hand_value(player_hand, "player-value");
}

function update_history(){
    var history_string = "";
    for(let i = 0;i < play_history.length;i+=1){
        history_string += "<div class=\"col s1\"><p>" + play_history[i][0] + ": " + play_history[i][1] + " &rarr; " + play_history[i][2] + "</p></div>\n";
    }
    document.getElementById("play-history").innerHTML = history_string;
}

//Initial setup

function new_hand(){
    if(card_deck.length < 30){
        card_deck = create_deck();
    }
    shuffle(card_deck);
    player_hand = [card_deck.pop(), card_deck.pop()];
    dealer_hand = [card_deck.pop(), card_deck.pop()];
    update_player();
    update_dealer();
    current_info = [get_hand_value(player_hand)];
    hand_resolved = false;
}

//Play functions/button handling

function hit_player(){
    if(hand_resolved)
        return;
    current_info.push("Hit");
    player_hand.push(card_deck.pop());
    current_info.push(get_hand_value(player_hand));
    update_player();
    if(get_hand_value(player_hand) > 21){
        resolve(false);
    }
}

function resolve(stay=true){
    hand_resolved = true;
    if(stay)
        current_info.push("Stay");
    else
        current_info.pop();
    while(get_hand_value(dealer_hand) <= 16){
        dealer_hand.push(card_deck.pop());
    }
    update_dealer(true);
    var result = "Push";
    var player_value = get_hand_value(player_hand);
    var dealer_value = get_hand_value(dealer_hand);
    if(player_value <= 21 && dealer_value <= 21){
        if(player_value > dealer_value){
            result = "Win";
        }
        else if(player_value < dealer_value){
            result = "Loss";
        }
    }
    else if(player_value > 21 && dealer_value <= 21){
        result = "Loss";
    }
    else if(player_value <= 21 && dealer_value > 21){
        result = "Win";
    }
    for(let i = 0;i < current_info.length;i+=2){
        play_history.push([current_info[i], current_info[i+1], result]);
    }
    console.log(current_info);
    console.log(play_history);
    while(play_history.length > PLAY_HISTORY_LENGTH){
        play_history.shift();
    }
    update_history();
    setTimeout(new_hand, 1000);
}

new_hand();