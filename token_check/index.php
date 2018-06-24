<?php
#error_reporting(E_ALL);
#ini_set('display_errors', 1);

include 'dbconnect.php';
include 'include_language.php';
include 'include_header.php';

$action = isset($_POST['form_action']) ? $_POST['form_action'] : '';
$error = '';
?>

<!-- Copied from site, slightly modified -->
<header class="banner navbar navbar-default navbar-static-top " role="banner">
<div class="container">
<div class="navbar-header">
<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
<span class="sr-only">Toggle navigation</span>
<span class="icon-bar"></span>
<span class="icon-bar"></span>
<span class="icon-bar"></span>
</button>
<div id="logo">
<a href="https://eosdac.io/">
<img class="logo-main logo-reg" src="https://eosdac.io/wp-content/uploads/2018/03/eosdaclogo1-200-text-new-250x50.png" height="50" width="250" alt="eosDAC">
</a>
</div>
</div>
<nav class="collapse navbar-collapse bs-navbar-collapse" role="navigation">
<ul id="menu-menu-1" class="nav navbar-nav"><li class="menu-checkpoint"><a href="https://eosdac.io/checkpoint/">Checkpoint</a></li>
<li class="menu-team"><a href="https://eosdac.io/team/">Team</a></li>
<li class="menu-operations"><a href="https://eosdac.io/operations/">Operations</a></li>
<li class="menu-exchanges"><a href="https://eosdac.io/exchanges/">Exchanges</a></li>
<li class="menu-legal"><a href="https://eosdac.io/terms/">Legal</a></li>
<li class="menu-faq"><a href="https://eosdac.io/faq/">FAQ</a></li>
<li class="menu-news"><a href="https://eosdac.io/news/">News</a></li>
</ul>
</li>
</ul> </nav>
</div>
</header>
<!-- End copy -->

    <div class="container">
    <form method="POST">
        <input type="hidden" name="form_action" value="">
        <select name="lang" onchange="this.form.submit()">
        <?php
        foreach ($supported_languages as $language_code => $language_description) {
            $selected = '';
            if ($lang == $language_code) {
                $selected = ' selected';
            }
            print "<option" . $selected . " value=\"" . $language_code . "\">" . $language_description . "</option>";
        }
        ?>
        </select>
    </form>
<?php
    print "<h1>" . $strings['welcome_message'] . '</h1>';
    print "<p>" . $strings['tool_explanation'] . '</p>';
    // LOOK UP ADDRESS

/*
CREATE TABLE `eosdac_final_todrop` (
  `id` int(11) NOT NULL,
  `eth_address` varchar(42) CHARACTER SET utf8 DEFAULT NULL,
  `eosdac_tokens` decimal(13,4) DEFAULT NULL,
  `eos_key` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_name` varchar(256) DEFAULT NULL,
  `isedfallback` int(11) DEFAULT NULL,
  `iscontract` int(1) NOT NULL,
  `trx` varchar(80) NOT NULL DEFAULT '',
  `account_valid` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
*/

    if ($action == 'lookup') {
        $search_value = isset($_POST['search_value']) ? mysqli_real_escape_string($conn,$_POST['search_value']) : '';
        if ($search_value == '') {
            $error = $strings['missing_search_value'];
        }
        if ($error == '') {
            $query = "SELECT * FROM eosdac_final_todrop WHERE eth_address = '" . $search_value . "' OR account_name = '" . $search_value . "' OR eos_key = '" . $search_value . "'";
            $result = mysqli_query($conn, $query);
            $has_results = 0;
            $info = '';
            while($value = $result->fetch_array(MYSQLI_ASSOC)){
                if ($has_results == 0) {
                    print '<table class="table">';
                }
                $has_results = 1;
                print '<tr><th>' . $strings['eos_account_name'] . '</th><th>' . $strings['eos_public_key'] . '</th></tr>';
                print '<tr>';
                print '<td><a href="https://eospark.com/MainNet/account/' . $value['account_name'] . '">' . $value['account_name'] . '</a></td><td>' . $value['eos_key'] . '</td>';
                print '</tr>';
                print '<tr><th>' . $strings['ethereum_address'] . '</th><th>' . $strings['eosdac_token_amount'] . '</th></tr>';
                print '<tr>';
                print '<td>' . $value['eth_address'] . '</td><td>' . number_format($value['eosdac_tokens'],4) . '</td></tr>';
                print '<tr>';
        print '<th>' . $strings['eos_transaction'] . '</th><th>' . $strings['view_online'] . '</th></tr>'; 
        print '<tr>';
        print '<td>' . $value['trx'] . '</td><td><a href="https://eospark.com/MainNet/tx/' . $value['trx'] . '">EOS Park</a> | <a href="https://eostracker.io/transactions/' . $value['trx'] . '">EOS Tracker</a></td></tr>';
            }
            if ($has_results) {
                print '</table>';
            } else {
                $error = $strings['entry_not_found'];
            }
        }
        if ($error != '') {
            $action = '';    
        } else {
            ?>
            <br />
            <form method="POST">
                <input type="hidden" name="form_action" value="">
                <input type="hidden" name="lang" value="<?php print $lang; ?>">
                <button type="submit" class="btn btn-primary"><?php print $strings['start_over']; ?></button>
            </form>
            <?php
        }
    }
    // BEING HERE
    if ($action == '') {
        if ($error) {
            ?>
            <div class="alert alert-danger" role="alert">
              <?php print $error; ?>
            </div>
            <?php
        }
        ?>
        <form method="POST">
            <div class="form-group">
                <label for="search_value"><?php print $strings['search_value']; ?></label>
                <input type="text" class="form-control" name="search_value" id="search_value" placeholder="<?php print $strings['search_value']; ?>">
                <small id="search_value" class="form-text text-muted"><?php print $strings['no_private_key']; ?></small>
            </div>
            <br />
            <input type="hidden" name="form_action" value="lookup">
            <input type="hidden" name="lang" value="<?php print $lang; ?>">
            <button type="submit" class="btn btn-primary"><?php print $strings['submit']; ?></button>
        </form>
        <br/>
        <br/>
        <hr/>
        <?php
    }
    ?>
    </div>
</body>
</html>
