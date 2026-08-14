<?php

namespace App\Services;

class NumberToWordsService
{
    private static array $unidades = [
        '', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
        'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE',
        'VEINTE', 'VEINTIÚN', 'VEINTIDÓS', 'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISEIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE'
    ];

    private static array $decenas = [
        '', '', '', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
    ];

    private static array $centenas = [
        '', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SIETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'
    ];

    public static function convert(float|int $number): string
    {
        $number = (int) round($number);

        if ($number === 0) {
            return 'CERO PESOS CLP';
        }

        $millones = (int) floor($number / 1000000);
        $restoMillones = $number % 1000000;

        $miles = (int) floor($restoMillones / 1000);
        $unidades = $restoMillones % 1000;

        $text = '';

        if ($millones > 0) {
            if ($millones === 1) {
                $text .= 'UN MILLÓN ';
            } else {
                $text .= self::convertGroup($millones) . ' MILLONES ';
            }
        }

        if ($miles > 0) {
            if ($miles === 1) {
                $text .= 'UN MIL ';
            } else {
                $text .= self::convertGroup($miles) . ' MIL ';
            }
        }

        if ($unidades > 0) {
            $text .= self::convertGroup($unidades);
        }

        $text = trim($text);
        return $text . ' PESOS CLP';
    }

    private static function convertGroup(int $n): string
    {
        if ($n === 0) return '';
        if ($n === 100) return 'CIEN';

        $c = (int) floor($n / 100);
        $r = $n % 100;

        $str = '';

        if ($c > 0) {
            if ($c === 1 && $r > 0) {
                $str .= 'CIENTO ';
            } else {
                $str .= self::$centenas[$c] . ' ';
            }
        }

        if ($r > 0) {
            if ($r < 30) {
                $str .= self::$unidades[$r];
            } else {
                $d = (int) floor($r / 10);
                $u = $r % 10;
                $str .= self::$decenas[$d];
                if ($u > 0) {
                    $str .= ' Y ' . self::$unidades[$u];
                }
            }
        }

        return trim($str);
    }
}
