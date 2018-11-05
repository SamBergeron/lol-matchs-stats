class staticDataCache {
    constructor () {}
    setProfileIcons(icons) { this.icons = Object.values(icons.data) };
    getProfileIcons(icons) { return this.icons };
    setChampionList(champions) { this.champions = Object.values(champions.data) };
    getChampionList() { return this.champions };
    setSummonerSpellsList(spells) { this.spells = Object.values(spells.data) };
    getSummonerSpellsList() { return this.spells };
    setItemList(items) { this.items = Object.values(items.data) };
    getItemList() { return this.items };
    setRuneList(runeCategories) {
        let runes = [];
        runeCategories.forEach(category => {
            category.slots.forEach(slot => {
                slot.runes.forEach(rune => {
                    runes.push(rune);
                })
            })
        });
        this.runes = runes;
    };
    getRuneList() { return this.runes };
}

module.exports = staticDataCache;