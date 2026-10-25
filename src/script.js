// URL da lista com todos os pokémons (paginação via offset e limit)
const URL_LISTA = "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=1292";
const URL_POKEMON = "https://pokeapi.co/api/v2/pokemon/";

// Cores para cada tipo (desafio extra)
const CORES_TIPOS = {
  normal: "#a8a77a", fire: "#ee8130", water: "#6390f0", electric: "#d4ac0d",
  grass: "#7ac74c", ice: "#56c4c0", fighting: "#c22e28", poison: "#a33ea1",
  ground: "#c9a43a", flying: "#8f7ee0", psychic: "#f95587", bug: "#8a9a1b",
  rock: "#b6a136", ghost: "#735797", dragon: "#6f35fc", dark: "#705746",
  steel: "#8e8ea8", fairy: "#d685ad"
};

// Elementos da página
const elNumero = document.getElementById("numero");
const elImagem = document.getElementById("imagem");
const elStatus = document.getElementById("status");
const elNome = document.getElementById("nome");
const elTipos = document.getElementById("tipos");
const elAltura = document.getElementById("altura");
const elPeso = document.getElementById("peso");
const btnAnterior = document.getElementById("anterior");
const btnProximo = document.getElementById("proximo");
const formBusca = document.getElementById("busca");
const campoBusca = document.getElementById("campoBusca");

let listaPokemons = []; // array com { name, url } de cada pokémon
let indiceAtual = 0;    // posição do pokémon mostrado na lista

// Busca a lista completa de pokémons
async function carregarLista() {
  const resposta = await fetch(URL_LISTA);
  if (!resposta.ok) throw new Error("Erro ao carregar a lista");
  const dados = await resposta.json();
  return dados.results;
}

// Busca as informações de um pokémon pelo nome ou número
async function buscarPokemon(nomeOuNumero) {
  const resposta = await fetch(URL_POKEMON + nomeOuNumero);
  if (!resposta.ok) throw new Error("Pokémon não encontrado");
  return await resposta.json();
}

// Mostra o pokémon da posição atual da lista
async function mostrarPokemon() {
  const nome = listaPokemons[indiceAtual].name;
  definirCarregando(true);

  try {
    const pokemon = await buscarPokemon(nome);
    renderizar(pokemon);
  } catch (erro) {
    elStatus.textContent = "Erro ao carregar :(";
    console.error(erro);
  } finally {
    definirCarregando(false);
  }
}

// Atualiza a tela com os dados do pokémon
function renderizar(pokemon) {
  elNome.textContent = pokemon.name;
  elNumero.textContent = "#" + String(pokemon.id).padStart(3, "0");

  const imagem = pokemon.sprites.front_default;
  if (imagem) {
    elImagem.src = imagem;
    elImagem.alt = pokemon.name;
    elImagem.style.display = "block";
    elStatus.textContent = "";
  } else {
    elImagem.style.display = "none";
    elStatus.textContent = "Sem imagem";
  }

  // Tipos
  elTipos.innerHTML = "";
  pokemon.types.forEach((item) => {
    const span = document.createElement("span");
    span.className = "tipo";
    span.textContent = item.type.name;
    span.style.background = CORES_TIPOS[item.type.name] || "#777";
    elTipos.appendChild(span);
  });

  // A API retorna altura em decímetros e peso em hectogramas
  elAltura.textContent = (pokemon.height / 10).toFixed(1) + " m";
  elPeso.textContent = (pokemon.weight / 10).toFixed(1) + " kg";
}

function definirCarregando(carregando) {
  btnAnterior.disabled = carregando;
  btnProximo.disabled = carregando;
  if (carregando) {
    elImagem.style.display = "none";
    elStatus.textContent = "Carregando...";
  }
}

// Botão anterior: no primeiro, vai para o último
btnAnterior.addEventListener("click", () => {
  indiceAtual = indiceAtual === 0 ? listaPokemons.length - 1 : indiceAtual - 1;
  mostrarPokemon();
});

// Botão próximo: no último, volta para o primeiro
btnProximo.addEventListener("click", () => {
  indiceAtual = indiceAtual === listaPokemons.length - 1 ? 0 : indiceAtual + 1;
  mostrarPokemon();
});

// Navegação pelas setas do teclado
document.addEventListener("keydown", (evento) => {
  if (document.activeElement === campoBusca) return;
  if (evento.key === "ArrowLeft") btnAnterior.click();
  if (evento.key === "ArrowRight") btnProximo.click();
});

// Busca por nome ou número (desafio extra)
formBusca.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const termo = campoBusca.value.trim().toLowerCase();
  if (!termo) return;

  let indice;
  if (/^\d+$/.test(termo)) {
    indice = Number(termo) - 1; // número a partir de 1
  } else {
    indice = listaPokemons.findIndex((p) => p.name === termo);
  }

  if (indice >= 0 && indice < listaPokemons.length) {
    indiceAtual = indice;
    campoBusca.value = "";
    mostrarPokemon();
  } else {
    alert("Pokémon não encontrado!");
  }
});

// Inicia a Pokédex mostrando o primeiro pokémon
async function iniciar() {
  try {
    definirCarregando(true);
    listaPokemons = await carregarLista();
    await mostrarPokemon();
  } catch (erro) {
    elStatus.textContent = "Erro ao conectar na API";
    console.error(erro);
  }
}

iniciar();
