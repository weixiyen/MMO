from scrapemark import scrape

s = scrape("""
	<table class='data'>
        <tr />
        {*
            <tr>
                <td><a>{{ [players] }}</a></td>
                <td>{{ [teams] }}</td>
                <td>{{ [positions] }}</td>
                <td>{{ [ranks] }}</td>
            </tr>
        *}
        </table>
""",
url='http://subscribers.footballguys.com/apps/adp.php?viewpos=all&sortby=name')

players = s['players']
teams = s['teams']
positions = s['positions']
ranks = s['ranks']

nfl_players = []
for i in range(len(players)):
    name = players[i].split(' ')
    f_name = name[0]
    l_name = name[1]
    team = teams[i]
    position = positions[i]
    rank = ranks[i]
    if position != 'TD':
        nfl_players.append({
            'position': str(position),
            'last_name': str(l_name),
            'first_name': str(f_name),
            'team': str(team),
            'active': 1
        })
        print "{0},".format({
            'position': str(position),
            'last_name': str(l_name),
            'first_name': str(f_name),
            'team': str(team),
            #'rank': int(rank),
            'active': 1
        })
