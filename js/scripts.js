// IIFE function to make the data structure private.
// It returns an object which contains references to the functions to manipulate the data structure.
// The data structure remains "private" i.e. not directly accessible from the global environment.
let pokemonRepository = (function () {
  let pokemonList = [];
  const apiUrl = "https://pokeapi.co/api/v2/pokemon/?limit=150";
  const modalContainer = $("#modal-container");

  //add adds the pokemon passed as argument to the end of the pokemonList
  function add(pokemon) {
    if (typeof pokemon === "object" && "name" in pokemon) {
      pokemonList.push(pokemon);
    } else {
      console.error(`Sorry bro, that's not a valid pokemon 👎: ${pokemon}`);
    }
  }

  //getAll returns the pokemonList array
  function getAll() {
    return pokemonList;
  }

  //addListItem adds a list item to the list passed as second argument
  //The list item will contain a button which text is the pokemon name passed as first argument
  function addListItem(pokemon) {
    //select the list to populate
    const pokemonCollection = $(".pokemon-list");
    //create a list item
    let listItem = $("<li></li>");
    listItem.addClass("list-group-item");
    //create a button
    let button = $(
      '<button class="pokemon-button btn glow-on-hover"></button>'
    );
    //change the button text to the current pokemon name
    button.text(pokemon.name);

    //append the button to the list item
    listItem.append(button);
    //append the list item to the list
    pokemonCollection.append(listItem);
    //add eventlistener to button
    showOnClick(button, pokemon);
  }

  //searchPokemon filters the pokemonList, searching by name
  function searchPokemon(nameToSearch) {
    return pokemonList.filter((pokemon) => pokemon.name.includes(nameToSearch));
  }

  function loadList() {
    showLoadingMessage();
    return fetch(apiUrl)
      .then(function (response) {
        hideLoadingMessage();
        return response.json();
      })
      .then(function (json) {
        json.results.forEach(function (item) {
          let pokemon = {
            //saving the pokemon name with an uppercase letter
            name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
            detailsUrl: item.url,
          };

          add(pokemon);
        });
      })
      .catch(function (e) {
        hideLoadingMessage();
        console.error(e);
      });
  }

  function loadDetails(item) {
    showLoadingMessage();
    let url = item.detailsUrl;
    let name = item.name;
    return fetch(url)
      .then(function (response) {
        hideLoadingMessage();
        return response.json();
      })
      .then(function (details) {
        item.name = name;
        item.imageUrl = details.sprites.front_default;
        item.height = details.height / 10; //meters
        item.weight = details.weight / 10; //kg
        item.types = details.types;
        item.abilities = details.abilities;
        item.artworkUrl = details.sprites.other.dream_world.front_default;
      })
      .catch(function (e) {
        hideLoadingMessage();
        console.error(e);
      });
  }

  //event handler function that prints the clicked pokemon's name to the console
  //the pokemon argument is actually the event object
  function showDetails(pokemonToShow) {
    pokemonRepository.loadDetails(pokemonToShow).then(function () {
      populateModal(pokemonToShow);
    });
  }

  function showLoadingMessage() {
    const loadingMessageArea = document.querySelector(".loading-message-area");
    if (loadingMessageArea.classList.contains("hide")) {
      loadingMessageArea.classList.remove("hide");
      let message = document.createElement("p");
      message.classList.add("loading-msg");
      message.innerText = "Please wait, gotta fetch 'em all ...";
      loadingMessageArea.appendChild(message);
    }
  }

  function hideLoadingMessage() {
    const loadingMessageArea = document.querySelector(".loading-message-area");
    if (!loadingMessageArea.classList.contains("hide")) {
      loadingMessageArea.classList.add("hide");
      //remove the message
      let message = document.querySelector(".loading-msg");
      loadingMessageArea.removeChild(message);
    }
  }

  function populateModal(pokemonToShow) {
    //populating name
    let pokemonName = modalContainer.querySelector(".pokemon-name");
    pokemonName.innerText = pokemonToShow.name;

    //populating types
    let pokemonTypes = modalContainer.querySelector(".types");
    //remove previous types if any
    pokemonTypes.innerHTML = "";
    pokemonToShow.types.forEach((type) => {
      console.log(type.type.name);
      let listItem = document.createElement("li");
      listItem.innerText = type.type.name;
      pokemonTypes.appendChild(listItem);
    });

    //populating img
    let pokemonImage = modalContainer.querySelector(".pokemon-img");
    pokemonImage.setAttribute("src", pokemonToShow.artworkUrl);
    pokemonImage.setAttribute(
      "alt",
      `Official artwork representing ${pokemonToShow.name}`
    );

    //populating height and weight
    let pokemonHeight = modalContainer.querySelector(".pokemon-height");
    let pokemonWeight = modalContainer.querySelector(".pokemon-weight");
    pokemonHeight.innerText = pokemonToShow.height;
    pokemonWeight.innerText = pokemonToShow.weight;

    //populating abilities
    let abilityList = document.querySelector(".ability-list");
    abilityList.innerHTML = "";

    pokemonToShow.abilities.forEach((ability) => {
      console.log(ability.ability.name);
      let abilityItem = document.createElement("li");
      abilityItem.innerText = ability.ability.name;
      abilityList.appendChild(abilityItem);
    });

    if (modalContainer.classList.contains("is-not-visible")) {
      modalContainer.classList.remove("is-not-visible");
    }
    modalContainer.classList.add("is-visible");
  }

  //event listeners

  //addEvent takes care of binding the click event with the event handler
  function showOnClick(button, pokemon) {
    button.on("click", function (event) {
      showDetails(pokemon);
    });
  }

  return {
    getAll,
    add,
    searchPokemon,
    addListItem,
    loadList,
    loadDetails,
    showDetails,
    showLoadingMessage,
    hideLoadingMessage,
  };
})();

pokemonRepository.loadList().then(function () {
  //data is loaded into pokemon pokemonList array
  pokemonRepository.getAll().forEach((pokemon) => {
    pokemonRepository.addListItem(pokemon);
  });
});
