<?php

namespace App;

enum PaymentMethod: string
{
    case QRIS = "qris";
    case Cash = "cash";
    case Bank = "bank";
}
