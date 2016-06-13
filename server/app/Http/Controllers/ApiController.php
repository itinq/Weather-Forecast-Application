<?php namespace App\Http\Controllers;

use Cache;

class ApiController extends Controller {

	/*
	|--------------------------------------------------------------------------
	| Home Controller
	|--------------------------------------------------------------------------
	|
	| This controller renders your application's "dashboard" for users that
	| are authenticated. Of course, you are free to change or remove the
	| controller as you wish. It is just here to get your app started!
	|
	*/

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		//$this->middleware('auth');
	}

	/**
	 * Show the application dashboard to the user.
	 *
	 * @return Response
	 */
	public function index()
	{
		return 'Hello, API';
	}

	public function get($string)
	{
		$symbols = array('.', ',');
		$uniqID = str_replace($symbols, '', $string);

		if (Cache::has($uniqID))
		{
			$data = Cache::get($uniqID);
		}
		else
		{
			$coords = explode(',', $string);
			$res = file_get_contents('https://api.forecast.io/forecast/2b6902cfef2110feee5171d0d97fb527/' . $coords[0] . ',' . $coords[1]);
			$raw = json_decode($res);
			$data[0] = array(
						'time' => $raw->currently->time,
						'summary' => $raw->currently->summary,
						'icon' => $raw->currently->icon,
						'temperature' => $raw->currently->temperature,
						'temperatureMin' => $raw->currently->temperature,
						'temperatureMax' => $raw->currently->temperature,
					);

			for ($i = 0; $i < count($raw->daily->data) - 2; $i++) { 
				$data[$i+1] = array(
							'time' => $raw->daily->data[$i]->time,
							'summary' => $raw->daily->data[$i]->summary,
							'icon' => $raw->daily->data[$i]->icon,
							'temperature' => $raw->daily->data[$i]->temperatureMax,
							'temperatureMin' => $raw->daily->data[$i]->temperatureMin,
							'temperatureMax' => $raw->daily->data[$i]->temperatureMax,
						);
			}
			Cache::add($uniqID, $data, env('CACHE_TIMEOUT', 60));

		}
		return response()->json($data);

	}

}
