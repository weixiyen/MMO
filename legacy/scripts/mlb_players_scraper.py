from scrapemark import scrape

s = scrape("""
    {*
        <tr class="pncPlayerRow">
        <td class="playertableData">{{[ranks]}}</td>
        <td class="playertablePlayerName"><a>{{[players]}}</a>, {{[teams]}}&nbsp;{{[positions]}}</td>
        </tr>
    *}
""",
url = 'http://games.espn.go.com/flb/tools/projections?&slotCategoryGroup=2&startIndex=400')

ranks = s['ranks']
players = s['players']
teams = s['teams']
positions = s['positions']

nba_players = []
for i in range(len(players)):
    name = players[i].split(' ')
    f_name = name[0]
    l_name = name[1]
    team = teams[i]
    position = positions[i].replace('&nbsp;','').split(',')
    try:
        position[0] = str(position[0].strip())
        position[1] = str(position[1].strip())
    except:
        pass
    rank = ranks[i]
    nba_players.append({
        'position': str(position),
        'last_name': str(l_name),
        'first_name': str(f_name),
        'team': str(team),
        'active': 1
    })
    print "{0},".format({
        'position': position,
        'last_name': str(l_name),
        'first_name': str(f_name),
        'team': str(team),
        'rank': int(rank),
        'active': 1
    })
