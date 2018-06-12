<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

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
CREATE TABLE `eos_snapshot` (
  `eos_account_name` varchar(100) NOT NULL,
  `ethereum_address` varchar(400) NOT NULL,
  `eosdac_token_amount` decimal(60,18) NOT NULL,
  `eos_token_amount` decimal(60,18) NOT NULL,
  `eos_public_key` varchar(400) NOT NULL,
  `eos_fallback_public_key` varchar(400) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
*/

    if ($action == 'lookup') {
        $search_value = isset($_POST['search_value']) ? mysqli_real_escape_string($conn,$_POST['search_value']) : '';
        if ($search_value == '') {
            $error = $strings['missing_search_value'];
        }
        if ($error == '') {
            $query = "SELECT * FROM eos_snapshot WHERE ethereum_address = '" . $search_value . "' OR eos_account_name = '" . $search_value . "' OR eos_public_key = '" . $search_value . "' OR eos_fallback_public_key = '" . $search_value . "'";
            $result = mysqli_query($conn, $query);
            $has_results = 0;
            $info = '';
            while($value = $result->fetch_array(MYSQLI_ASSOC)){
                if ($has_results == 0) {
                    print '<table class="table">';
                }
                $has_results = 1;
                print '<tr><th>' . $strings['eos_account_name'] . '</th><th>' . $strings['eos_public_key'] . '</th><th>' . $strings['eos_fallback_public_key'] . '</th></tr>';
                print '<tr>';
                print '<td>' . $value['eos_account_name'] . '</td><td>' . $value['eos_public_key'] . '</td><td>' . $value['eos_fallback_public_key'] . '</td><td>';
                print '</tr>';
                print '<tr><th>' . $strings['ethereum_address'] . '</th><th>' . $strings['eos_token_amount'] . '</th><th>' . $strings['eosdac_token_amount'] . '</th></tr>';
                print '<tr>';
                print '<td>' . $value['ethereum_address'] . '</td><td>' . number_format($value['eos_token_amount'],4) . '</td><td>' . number_format($value['eosdac_token_amount'],4) . '</td>';
                print '</tr>';
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